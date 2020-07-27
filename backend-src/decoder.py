import tensorflow as tf
import constants as c
import numpy as np
from attention import attention


class Decoder(tf.keras.Model):
    def __init__(self,masking_value):
        super(Decoder, self).__init__()
        self.batch_size     = c.batch_size
        self.masking_value  = masking_value
        self.gru_1          = tf.keras.layers.GRU(2*c.n_cell_dim,return_sequences=True,return_state=True,recurrent_initializer='glorot_uniform')
        self.gru_1.trainable=False
        self.dropout        = tf.keras.layers.Dropout(c.dropout)
        self.fc_1           = tf.keras.layers.Dense(128, activation="relu")
        self.fc_2           = tf.keras.layers.Dense(64,activation='relu')
        self.fc_3           = tf.keras.layers.Dense(c.n_output,activation='softmax')
        self.path_to_save   = 'Saved Models/decoder/'

        self.attention_h1   = attention(c.n_cell_dim)


    @tf.function
    def call(self, inputs, hidden, enc_output,Training=True):
        expanded_input                          = tf.expand_dims(inputs, 1)
        context_vector_h1, attention_weights_h1 = self.attention_h1(hidden, enc_output)
        x                                       = tf.concat([tf.expand_dims(context_vector_h1, 1),expanded_input], axis=-1)
        output, state                           = self.gru_1(x,hidden,training=Training)
        output                                  = tf.reshape(output,(-1,output.shape[-1]))

        DN_input                                = tf.concat([output,context_vector_h1],axis=-1)
        DN_input                                = self.fc_1(DN_input)
        DN_input                                = self.dropout(DN_input,training=Training)
        DN_input                                = self.fc_2(DN_input)
        output_char                             = self.fc_3(DN_input)

        # # listen, Attend and spell
        # expanded_input          = tf.expand_dims(inputs, 1)
        # GRU1_out,GRU1_state     = self.gru_1(expanded_input,hidden,training=Training)
        #
        # context_vector_h1, attention_weights_h1 = self.attention_h1(GRU1_out, enc_output,Training)
        #
        # GRU1_out    = tf.reshape(GRU1_out,(-1,GRU1_out.shape[-1]))
        # DN_input    = tf.concat([GRU1_out,context_vector_h1],axis=-1)
        # output_char = self.fc_2(DN_input)

        return output_char, state,attention_weights_h1
