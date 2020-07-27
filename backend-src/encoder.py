import tensorflow as tf
import numpy as np
import tensorflow.keras.layers as layers
import constants as c

class Encoder(tf.keras.Model):
    def __init__(self,masking_value=c.masking_value):
        super(Encoder,self).__init__()
        self.path_to_save   = 'Saved Models/encoder/encoder'
        # First Layer
        self.fwd_gru_1      = layers.GRU(c.n_cell_dim,return_sequences=True,
                                                      return_state=True,
                                                      recurrent_initializer='glorot_uniform')
        self.bwd_gru_1      = layers.GRU(c.n_cell_dim,return_sequences=True,
                                                      return_state=True,
                                                      go_backwards=True,
                                                      recurrent_initializer='glorot_uniform')
        self.gru_1          = layers.Bidirectional(self.fwd_gru_1, backward_layer=self.bwd_gru_1)

        # Second Layer
        self.fwd_gru_2      = layers.GRU(c.n_cell_dim,return_sequences=True,
                                                      return_state=True,
                                                      recurrent_initializer='glorot_uniform',
                                                      dropout=c.dropout)
        self.bwd_gru_2      = layers.GRU(c.n_cell_dim,return_sequences=True,
                                                      return_state=True,
                                                      go_backwards=True,
                                                      recurrent_initializer='glorot_uniform',
                                                      dropout=c.dropout)
        self.gru_2          = layers.Bidirectional(self.fwd_gru_2, backward_layer=self.bwd_gru_2)

        # third Layer
        self.fwd_gru_3      = layers.GRU(c.n_cell_dim,return_sequences=True,
                                                      return_state=True,
                                                      recurrent_initializer='glorot_uniform',
                                                      dropout=c.dropout)
        self.bwd_gru_3      = layers.GRU(c.n_cell_dim,return_sequences=True,
                                                      return_state=True,
                                                      go_backwards=True,
                                                      recurrent_initializer='glorot_uniform',
                                                      dropout=c.dropout)
        self.gru_3         = layers.Bidirectional(self.fwd_gru_3, backward_layer=self.bwd_gru_3,merge_mode='concat')

        # fourth Layer
        self.fwd_gru_4      = layers.GRU(c.n_cell_dim,return_sequences=True,
                                                      return_state=True,
                                                      recurrent_initializer='glorot_uniform')
        self.bwd_gru_4      = layers.GRU(c.n_cell_dim,return_sequences=True,
                                                      return_state=True,
                                                      go_backwards=True,
                                                      recurrent_initializer='glorot_uniform')
        self.gru_4         = layers.Bidirectional(self.fwd_gru_4, backward_layer=self.bwd_gru_4,merge_mode='concat')

        self.fwd_gru_1.trainable=False
        self.bwd_gru_1.trainable=False

        self.fwd_gru_2.trainable=False
        self.bwd_gru_2.trainable=False

        self.fwd_gru_3.trainable=False
        self.bwd_gru_3.trainable=False

        self.fwd_gru_4.trainable=False
        self.bwd_gru_4.trainable=False

        self.masking_value  = masking_value
    @tf.function
    def call(self,inputs,initial_fwd_hidden,initial_bwd_hidden,Training=True):
        length            = tf.shape(inputs)[-2]
        # First GRU
        mask = tf.keras.backend.equal(inputs,self.masking_value)
        mask = tf.reduce_all(mask,axis=-1)
        mask = tf.math.logical_not(mask)
        encoder_out, encoder_hidden_fwd,encoder_hidden_bwd = self.gru_1(inputs,mask=mask,training=Training)
        mask = tf.cast(mask,dtype=tf.float32)
        mask = tf.expand_dims(mask,-1)
        encoder_out = encoder_out * mask

        # Second GRU
        enc1    = encoder_out[:,::2,:]
        enc2    = encoder_out[:,1::2,:]
        if length%2!=0:
            paddings    = [[0, 0], [0,1],[0,0]]
            enc2        = tf.pad(enc2, paddings, 'CONSTANT', constant_values=0)
        encoder_in = tf.concat([enc1,enc2],axis=-1)
        mask = tf.keras.backend.equal(encoder_in,0)
        mask = tf.reduce_all(mask,axis=-1)
        mask = tf.math.logical_not(mask)
        encoder_out, encoder_hidden_fwd,encoder_hidden_bwd = self.gru_2(encoder_in,mask=mask,training=Training)
        mask = tf.cast(mask,dtype=tf.float32)
        mask = tf.expand_dims(mask,-1)
        encoder_out = encoder_out * mask

        # Third GRU
        length  = tf.math.ceil(length/2)
        enc1    = encoder_out[:,::2,:]
        enc2    = encoder_out[:,1::2,:]
        if length%2!=0:
            paddings    = [[0, 0], [0,1],[0,0]]
            enc2        = tf.pad(enc2, paddings, 'CONSTANT', constant_values=0)
        encoder_in = tf.concat([enc1,enc2],axis=-1)
        mask = tf.keras.backend.equal(encoder_in,0)
        mask = tf.reduce_all(mask,axis=-1)
        mask = tf.math.logical_not(mask)
        encoder_out, encoder_hidden_fwd,encoder_hidden_bwd = self.gru_3(encoder_in,mask=mask,training=Training)
        mask = tf.cast(mask,dtype=tf.float32)
        mask = tf.expand_dims(mask,-1)
        encoder_out = encoder_out * mask

        # Fourth GRU
        length  = tf.math.ceil(length/2)
        enc1    = encoder_out[:,::2,:]
        enc2    = encoder_out[:,1::2,:]
        if length%2!=0:
            paddings    = [[0, 0], [0,1],[0,0]]
            enc2        = tf.pad(enc2, paddings, 'CONSTANT', constant_values=0)
        encoder_in = tf.concat([enc1,enc2],axis=-1)
        mask = tf.keras.backend.equal(encoder_in,0)
        mask = tf.reduce_all(mask,axis=-1)
        mask = tf.math.logical_not(mask)
        encoder_out, encoder_hidden_fwd,encoder_hidden_bwd = self.gru_4(encoder_in,mask=mask,training=Training)
        mask = tf.cast(mask,dtype=tf.float32)
        mask = tf.expand_dims(mask,-1)
        encoder_out = encoder_out * mask

        hidden_state = tf.concat([encoder_hidden_fwd,encoder_hidden_bwd],axis=-1)

        return encoder_out,hidden_state

    def initial_hidden_state(self,batch_size=c.batch_size):
        fwd = bwd = tf.zeros((c.batch_size,c.n_cell_dim))
        return fwd,bwd
