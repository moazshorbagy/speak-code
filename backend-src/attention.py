import tensorflow as tf
import constants as c
import numpy as np

class attention(tf.keras.layers.Layer):
    def __init__(self,units):
        super(attention, self).__init__()
        self.path_to_save   = 'Saved Models/attention/'
        self.units      = units
        self.W1         = tf.keras.layers.Dense(self.units)
        self.W2         = tf.keras.layers.Dense(self.units)
        self.V          = tf.keras.layers.Dense(1)
        self.W1.trainable = False
        self.W2.trainable = False
        self.V.trainable = False
        self.dropout    = tf.keras.layers.Dropout(c.dropout)

    @tf.function
    def call(self,query, values,Training=True):
        mask                    = tf.keras.backend.equal(values,0)
        mask                    = tf.reduce_all(mask,axis=-1)
        mask                    = tf.math.logical_not(mask)
        mask                    = tf.expand_dims(mask,axis=-1)

        query_with_time_axis    = tf.expand_dims(query, axis=1)
        score                   = self.V(tf.nn.tanh(self.W1(query_with_time_axis) + self.W2(values)))
        score                   = tf.where(mask,score,np.NINF)
        attention_weights       = tf.nn.softmax(score, axis=1)
        context_vector          = tf.reduce_sum(tf.linalg.matmul(tf.linalg.matrix_transpose(attention_weights),values), axis=1)

        return context_vector, attention_weights


    def initial_attention_weights(self,batch=c.batch_size):
        return np.zeros((batch,c.max_X_seq_len,1))
