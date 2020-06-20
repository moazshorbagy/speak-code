import tensorflow as tf
from tensorflow.keras.models import Model
from tensorflow.keras.layers import Input, Dense, Dropout, GRU, Bidirectional, Concatenate, Lambda, TimeDistributed, Masking, BatchNormalization
from tensorflow.keras.optimizers import Adam
from tensorflow.keras import backend as k
from attention import AttentionLayer

import numpy as np
import constants as c
from text import encode_to_one_hot,decode_from_one_hot

def create_model(max_input_seq_length, max_ouput_seq_length):
    k.clear_session()

    # Encoder

    encoder_input = Input(shape=(max_input_seq_length, c.n_input), name='encoder_input')

    encoder_gru = Bidirectional(GRU(c.n_cell_dim, return_sequences=True, return_state=True, name='encoder_gru'), name='bidirectional_encoder')

    encoder_out, encoder_fwd_state, encoder_back_state = encoder_gru(encoder_input)

    # Decoder

    decoder_input = Input(shape=(max_ouput_seq_length, c.n_output), name='decoder_input')

    decoder_gru = GRU(c.n_cell_dim*2, return_sequences=True, return_state=True, name='decoder_gru')

    decoder_init_state = Concatenate(axis=-1)([encoder_fwd_state, encoder_back_state])

    decoder_out, decoder_state = decoder_gru(decoder_input, initial_state=decoder_init_state)

    # Attention

    attn_layer = AttentionLayer(name='attention_layer')

    attn_out, attn_states = attn_layer([encoder_out, decoder_out])

    # Concat attention input and decoder GRU output

    decoder_concat_input = Concatenate(axis=-1, name='concat_layer')([decoder_out, attn_out])

    # Dense layer

    dense = Dense(c.n_output, activation=tf.nn.softmax, name='softmax_layer')

    dense_time = TimeDistributed(dense, name='time_distributed_layer')

    decoder_pred = dense_time(decoder_concat_input)

    # Full model (for training)

    full_model = Model(inputs=[encoder_input, decoder_input], outputs=decoder_pred)

    # Inference models (for prediction)
    batch_size = 1

    # Encoder inference model
    encoder_inf_input = Input(batch_shape=(batch_size, max_input_seq_length, c.n_input), name='encoder_inf_input')
    encoder_inf_out, encoder_inf_fwd_state, encoder_inf_back_state = encoder_gru(encoder_inf_input)
    encoder_model = Model(inputs=encoder_inf_input, outputs=[encoder_inf_out, encoder_inf_fwd_state, encoder_inf_back_state])

    # Decoder inference model
    encoder_inf_state = Input(batch_shape=(batch_size, max_input_seq_length, 2*c.n_cell_dim), name='encoder_inf_state')
    decoder_init_state = Input(batch_shape=(batch_size, 2*c.n_cell_dim), name='decoder_init')
    decoder_inf_input = Input(batch_shape=(batch_size, 1, c.n_output), name='decoder_inf_input')

    decoder_inf_out, decoder_inf_state = decoder_gru(decoder_inf_input, initial_state=decoder_init_state)
    attn_inf_out, attn_inf_states = attn_layer([encoder_inf_state, decoder_inf_out])
    decoder_inf_concat = Concatenate(axis=-1, name='concat_layer')([decoder_inf_out, attn_inf_out])
    decoder_inf_pred = TimeDistributed(dense)(decoder_inf_concat)
    decoder_model = Model(inputs=[encoder_inf_state, decoder_init_state, decoder_inf_input],
                          outputs=[decoder_inf_pred, attn_inf_states, decoder_inf_state])

    return full_model, encoder_model, decoder_model


def predict(encoder_model,decoder_model,data,beam_search=False):
    predictions=[]
    attention_weights = []
    for sample in data:
        encoder_out,encoder_fwd_state,encoder_back_state = encoder_model.predict(sample.reshape((1,sample.shape[0],sample.shape[1])))
        dec_init    = np.concatenate([encoder_fwd_state,encoder_back_state],axis=-1)
        decoder_out = np.zeros((1,1,c.n_output))
        decoder_out[0,0,-2]=1
        att_weights = []

        if not beam_search: # greedy search
            output=''
            while(1):
                decoder_out,attention,dec_init=decoder_model.predict([encoder_out,dec_init,decoder_out])
                chindex=np.argmax(decoder_out,axis=-1)[0,0]
                output+=c.alphabet[chindex]

                if output[-1]==c.end_token:
                    break
                
                att_weights.append((chindex, attention))

                decoder_out = np.zeros((1,1,c.n_output))
                decoder_out[0,0,chindex]=1
            predictions.append(output[:-1])
            attention_weights.append(att_weights)

        else: # beam search
            decoder_out,attention,dec_init=decoder_model.predict([encoder_out,dec_init,decoder_out])
            paths=[(c.alphabet[i],decoder_out[0,0,i],dec_init) for i in range(1,c.n_output)] # store tuple -> (path,path probability,dec_init)
            paths=sorted(paths,key=lambda x:x[1],reverse=True)[0:c.beam_width]

            while(1):
                new_paths=[]
                while paths:
                    path=paths.pop(0)
                    decoder_out,attention,dec_init=decoder_model.predict([encoder_out,path[2],encode_to_one_hot(path[0][-1])])
                    for char in c.alphabet[1:]:
                        new_paths.append((path[0]+char,path[1]*decoder_out[0,0,c.alphabet.index(char)],dec_init))

                paths=sorted(new_paths,key=lambda x:x[1],reverse=True)[0:c.beam_width]

                if paths[0][0][-1]==c.end_token:
                    break
            predictions.append(paths[0][0][:-1])
    return predictions, attention_weights


def create_optimizer():
    return Adam(learning_rate=c.learning_rate, beta_1=c.beta_1, beta_2=c.beta_2, amsgrad=True)

def create_loss_function():
    return tf.keras.losses.SparseCategoricalCrossentropy()

def create_model_checkpoint_cb():
    return tf.keras.callbacks.ModelCheckpoint(
        monitor='loss',
        filepath=c.checkpoint_filepath,
        save_weights_only=True,
        save_best_only=True)

def create_lr_scheduler_cb():
    return tf.keras.callbacks.LearningRateScheduler(scheduler)

def create_early_stopping_cb():
    # return tf.keras.callbacks.EarlyStopping(monitor='loss', patience=15)
    return EarlyStoppingCb()

class EarlyStoppingCb(tf.keras.callbacks.Callback):
    def on_epoch_end(self, epoch, logs={}):
        if(logs.get('accuracy')>0.998):
            print("\nReached 99.8% accuracy so cancelling training!")
            self.model.stop_training = True

def scheduler(epoch):
    """
    This function keeps the learning rate at 0.001 for the first ten epochs
    and decreases it exponentially after that.
    """
    if epoch < c.lr_decay_epoch:
        return c.learning_rate
    else:
        return max(c.learning_rate * tf.math.exp(0.1 * (c.lr_decay_epoch - epoch)), c.minimum_lr)
