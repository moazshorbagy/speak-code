import tensorflow as tf
import constants as c
import numpy as np
import time
import sys
import os

from language_model import LM
from cv_generator import generator_Sc as generator
from encoder import Encoder
from decoder import Decoder
from text import encode,encode_to_one_hot,decode,decode_from_one_hot


class Model():
    def __init__(self, cwd, load_checkpoints=False):
        self.encoder        = Encoder(c.masking_value)
        self.decoder        = Decoder(encode_to_one_hot(c.pad_token)[0][0])
        self.optimizer      = tf.keras.optimizers.Adam(c.learning_rate)
        self.loss_object    = tf.keras.losses.CategoricalCrossentropy(
                                from_logits=False, reduction='none',label_smoothing=0.1)
        self.training       = True

        self.cwd = cwd

        self.checkpoint_dir     = os.path.join(cwd, './training_checkpoints')
        self.checkpoint_prefix  = os.path.join(self.checkpoint_dir, "ckpt")
        self.checkpoint         = tf.train.Checkpoint(optimizer=self.optimizer,encoder=self.encoder,decoder=self.decoder)

        if load_checkpoints:
            status=self.checkpoint.restore(tf.train.latest_checkpoint(self.checkpoint_dir))
            status.assert_existing_objects_matched()

    @tf.function(input_signature=[tf.TensorSpec(shape=(c.batch_size,None,c.n_input)),
                                  tf.TensorSpec(shape=(c.batch_size,None,c.n_output)),
                                  tf.TensorSpec(shape=(c.batch_size,c.n_cell_dim)),
                                  tf.TensorSpec(shape=(c.batch_size,c.n_cell_dim))])
    def train_step(self,inputs,target,enc_fwd_hidden,enc_bwd_hidden):
        loss        = tf.convert_to_tensor(0.0)
        matches     = tf.zeros(shape=(c.batch_size))
        not_ignored = tf.zeros(shape=(c.batch_size))

        with tf.GradientTape() as tape:
            enc_output, enc_hidden = self.encoder(inputs, enc_fwd_hidden,enc_bwd_hidden)
            dec_hidden = enc_hidden
            dec_input = target[:, 0]
            for t in tf.range(1, tf.shape(target)[1]):
                predictions, dec_hidden, attention_weights = self.decoder(dec_input, dec_hidden, enc_output)
                loss += self.calculate_loss(target[:, t], predictions)

                acc = self.calculate_accuracy(target[:, t], predictions)
                matches+=acc[0]
                not_ignored+=acc[1]
                if np.random.random_sample()>=1.1: # teacher forcing
                    dec_input = target[:,t]
                else:                             # previous token
                    dec_input=tf.one_hot(tf.math.argmax(predictions,-1),c.n_output)

        batch_accuracy  = tf.reduce_mean(tf.clip_by_value(matches/not_ignored,0, 1))
        variables = self.encoder.trainable_variables + self.decoder.trainable_variables
        gradients = tape.gradient(loss, variables)
        self.optimizer.apply_gradients(zip(gradients, variables))

        return loss,batch_accuracy


    @tf.function(input_signature=[tf.TensorSpec(shape=(c.batch_size,None,c.n_input)),
                                  tf.TensorSpec(shape=(c.batch_size,None,c.n_output)),
                                  tf.TensorSpec(shape=(c.batch_size,c.n_cell_dim)),
                                  tf.TensorSpec(shape=(c.batch_size,c.n_cell_dim))])
    def validation_step(self,inputs,target,enc_fwd_hidden,enc_bwd_hidden):
        loss        = tf.convert_to_tensor(0.0)
        matches     = tf.zeros(shape=(c.batch_size))
        not_ignored = tf.zeros(shape=(c.batch_size))

        with tf.GradientTape() as tape:
            enc_output, enc_hidden = self.encoder(inputs, enc_fwd_hidden,enc_bwd_hidden,False)
            dec_hidden = enc_hidden
            dec_input = target[:, 0]

            for t in tf.range(1, tf.shape(target)[1]):
                predictions, dec_hidden, attention_weights = self.decoder(dec_input, dec_hidden, enc_output,False)
                loss += self.calculate_loss(target[:, t], predictions)

                acc = self.calculate_accuracy(target[:, t], predictions)
                matches+=acc[0]
                not_ignored+=acc[1]

                dec_input = tf.one_hot(tf.math.argmax(predictions,-1),c.n_output)

        batch_accuracy  = tf.reduce_mean(tf.clip_by_value(matches/not_ignored,0, 1))

        return loss,batch_accuracy


    def train(self,train_steps_per_epoch,dev_steps_per_epoch,number_of_epochs=c.epochs):
        train_generator =   generator()
        dev_generator   =   generator(data_type='dev')

        for epoch in range(number_of_epochs):
            start_time=time.time()

            train_total_loss     = 0
            train_total_accuracy = 0

            dev_total_loss      = 0
            dev_total_accuracy  = 0

            for batch_number in range(train_steps_per_epoch):
                enc_fwd,enc_bwd = self.encoder.initial_hidden_state()
                train_data,train_lag                         = next(train_generator)
                x = tf.convert_to_tensor(train_data[0],dtype=tf.float32)
                y = tf.convert_to_tensor(train_data[1],dtype=tf.float32)
                train_batch_loss,train_batch_accuracy        = self.train_step(x,y,enc_fwd,enc_bwd)
                train_total_loss                            += train_batch_loss
                train_total_accuracy                        += train_batch_accuracy

                print('batch {} loss is : {:.4f}    accuracy is : {:.4f}'.format(batch_number,
                                                                        tf.keras.backend.get_value(train_batch_loss),
                                                                        tf.keras.backend.get_value(train_batch_accuracy)
                                                                        ))

            self.checkpoint.save(self.checkpoint_prefix)
            for batch_number in range(dev_steps_per_epoch):
                dev_data,dev_lag                       = next(dev_generator)
                x = tf.convert_to_tensor(dev_data[0],dtype=tf.float32)
                y = tf.convert_to_tensor(dev_data[1],dtype=tf.float32)
                dev_batch_loss,dev_batch_accuracy      = self.validation_step(x,y,enc_fwd,enc_bwd)
                dev_total_loss                        += dev_batch_loss
                dev_total_accuracy                    += dev_batch_accuracy

            print('epoch {} takes {} seconds'.format(epoch,time.time()-start_time))
            print('end of epoch {} of {} train_loss = {:.4f} , val_loss = {:.4f} ,   training accuracy = {:.4f} ,   val accuracy = {:.4f}'.format(epoch+1,number_of_epochs,
                                                                                train_total_loss/train_steps_per_epoch,
                                                                                dev_total_loss/dev_steps_per_epoch,
                                                                                train_total_accuracy/train_steps_per_epoch,
                                                                                dev_total_accuracy/dev_steps_per_epoch))


    def predict(self,input_features,type=1):
        utterance='{}'.format(c.start_token)
        a,b=self.encoder.initial_hidden_state(1)
        enc_out, enc_hidden = self.encoder(input_features,a,b,False)
        dec_hidden = enc_hidden
        dec_input = encode_to_one_hot(utterance[0])[0]

        lm = LM(self.cwd)
        lm.load_lm()

        if type==2:
            predictions, dec_hidden, attention_weights = self.decoder(dec_input,dec_hidden,enc_out,False)
            paths=[(c.alphabet[i],predictions[0,i],dec_hidden) for i in range(c.n_output) if c.alphabet[i]!=c.start_token and c.alphabet[i]!=c.pad_token and c.alphabet[i]!=c.end_token and c.alphabet[i]!=' ']
            paths=sorted(paths,key=lambda x:x[1],reverse=True)[0:c.beam_width]
            start_time=time.time()
            for _ in range(input_features.shape[1]):
                new_paths=[]
                while paths:
                    path=paths.pop(0)
                    dec_input = tf.one_hot(encode(path[0][-1]),c.n_output)
                    predictions, dec_hidden, attention_weights = self.decoder(dec_input,path[-1],enc_out,False)

                    for i in range(c.n_output):
                        if c.alphabet[i]!=c.start_token and c.alphabet[i]!=c.pad_token:
                            if c.alphabet[i]!=c.end_token:
                                p=path[0]+c.alphabet[i]
                                prob=(path[1]*predictions[0,i]*0.99999)+(1e-5*lm.calculate_probability(p))
                                new_paths.append((p,prob,dec_hidden))
                            else:
                                if path[0]==' ' and c.alphabet[i]==' ':
                                    continue
                                p=path[0]+c.alphabet[i]
                                prob=path[1]*predictions[0,i]
                                new_paths.append((p,prob,dec_hidden))

                paths=sorted(new_paths,key=lambda x:x[1],reverse=True)[0:c.beam_width]
                print(paths[0][0])
                if paths[0][0][-1]==c.end_token or (time.time()-start_time)>5:
                    break
            return paths[0][0]
        else:
            count=0
            while(utterance[-1]!=c.end_token and count<=input_features.shape[1]):
                predictions, dec_hidden, attention_weights = self.decoder(dec_input,dec_hidden,enc_out,False)
                char_ID = tf.math.argmax(predictions,-1)
                char    = c.alphabet[char_ID[0].numpy()]
                utterance+=char
                dec_input=tf.one_hot(char_ID,c.n_output)
                count+=1

            return utterance[1:-1]


    def calculate_loss(self,true,pred):
        non_masked  = tf.math.logical_not(tf.math.equal(tf.math.argmax(true,-1),encode(c.pad_token)[0]))
        loss        = self.loss_object(true,pred)

        non_masked  = tf.cast(non_masked,dtype=loss.dtype)

        loss = loss * non_masked
        return tf.reduce_mean(loss)

    def calculate_accuracy(self,true,pred):
        new_true    =   tf.math.argmax(true,-1)
        new_pred    =   tf.math.argmax(pred,-1)
        not_ignored =   tf.math.logical_not(tf.math.equal(new_true,encode(c.pad_token)[0]))
        not_ignored =   tf.cast(not_ignored, 'float32')
        matches     =   tf.cast(tf.math.equal(new_true, new_pred), 'float32') * not_ignored

        return matches,not_ignored
