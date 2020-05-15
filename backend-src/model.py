import tensorflow as tf
from tensorflow.keras.models import Model
from tensorflow.keras.layers import Input, Dense, Dropout, LSTM, Bidirectional, Lambda, TimeDistributed, Masking, BatchNormalization
from tensorflow.keras.optimizers import Adam
from tensorflow.keras import backend as k

import constants as c

def create_model():
    k.clear_session()

    input_data      = Input(shape=(c.n_steps, c.n_input),name='input')

    model           = Masking(mask_value=c.masking_value,name='masking_layer')(input_data)
    model           = BatchNormalization(axis=-1)(model)
    model           = Dense(c.n_hidden_1,activation=tf.nn.relu,name='layer_1')(model)
    # model           = Dropout(c.dropout_1, name='droput_1')(model)

    model           = Dense(c.n_hidden_2, activation=tf.nn.relu, name='layer_2')(model)
    # model           = Dropout(c.dropout_2, name='droput_2')(model)

    model           = Dense(c.n_hidden_3, activation=tf.nn.relu, name='layer_3')(model)
    # model           = Dropout(c.dropout_3, name='droput_3')(model)

    model           = Bidirectional(LSTM(c.n_hidden_4, return_sequences=True))(model)
    # model           = Dropout(c.dropout_4, name='droput_4')(model)

    model           = TimeDistributed(Dense(c.n_hidden_5, activation=tf.nn.relu), name='layer_5')(model)
    # model           = Dropout(c.dropout_5, name='droput_5')(model)

    y_pred          = TimeDistributed(Dense(c.n_hidden_6, activation=tf.nn.softmax), name='output_layer')(model)

    labels          = Input(name='the_labels', shape=[None,], dtype = 'float32')

    input_length    = Input(name='input_length', shape=[1], dtype = 'float32')
    label_length    = Input(name='label_length', shape=[1], dtype = 'float32')

    loss_layer      = Lambda(function=create_loss_function, name='ctc', output_shape=[1])([y_pred, labels, input_length, label_length])

    model           = Model(inputs=[input_data, labels, input_length, label_length], outputs=[loss_layer])

    return model

def create_optimizer():
    return Adam(learning_rate=c.learning_rate, beta_1=c.beta_1, beta_2=c.beta_2, amsgrad=True)

def create_loss_function(args):
    y_pred, labels, input_length, label_length = args
    return k.ctc_batch_cost(labels, y_pred, input_length, label_length)

def create_early_stopping_cb():
    pass

def create_model_checkpoint_cb():
    pass

def create_early_stopping_cb():
    # return tf.keras.callbacks.EarlyStopping(monitor='loss', patience=15)
    return EarlyStoppingCb()

class EarlyStoppingCb(tf.keras.callbacks.Callback):
    def on_epoch_end(self, epoch, logs={}):
        if(logs.get('accuracy')>0.998):
            print("\nReached 99.8% accuracy so cancelling training!")
            self.model.stop_training = True
