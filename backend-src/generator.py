import numpy as np
import pandas as pd
from tensorflow.keras.preprocessing.sequence import pad_sequences
from sklearn.utils import shuffle

import os
from text import encode
import constants as c

def generator(X_train, Y_train, batch_size):

    i = 0
    X_shape = X_train.shape
    steps_per_epoch   =   int(np.ceil(X_shape[0]/batch_size))
    indecies          =   np.arange(0,X_shape[0],batch_size)
    indecies          =   np.concatenate((indecies,np.array([X_shape[0]])),axis=0)

    while True:
        if i==steps_per_epoch:
            X_train,Y_train=shuffle(X_train,Y_train,random_state=0)
            i=0

        x_train         =   X_train[indecies[i]:indecies[i+1]]
        y_train         =   Y_train[indecies[i]:indecies[i+1]]

        x_train         =   pad_sequences(x_train, padding='post', value=c.masking_value, dtype=np.float64)
        y_train         =   pad_sequences(y_train, padding='post', value=c.number_of_char, dtype=np.float64)

        input_length    =   np.reshape(np.array([x.shape[0] for x in X_train[indecies[i]:indecies[i+1]]]), (x_train.shape[0], 1))
        label_length    =   np.reshape(np.array([y.shape[0] for y in Y_train[indecies[i]:indecies[i+1]]]), (y_train.shape[0], 1))

        inputs          =   {'input':x_train, 'the_labels':y_train, 'input_length':input_length, 'label_length':label_length}

        outputs         =   {'ctc': np.zeros((x_train.shape[0], 1))}

        i += 1

        yield inputs, outputs

def cv_generator_compiled(data_type='train', batch_size=c.batch_size):

    data = pd.read_csv(os.path.join('CV', f'cv_{data_type}.csv')).to_numpy()
    np.random.shuffle(data)
    steps_per_epoch = data.shape[0]//batch_size
    i = 0

    while True:
        if i==steps_per_epoch:
            i = 0
            np.random.shuffle(data)

        batch_data = data[i*batch_size:(i+1)*batch_size]

        X = [''] * batch_size
        y = [''] * batch_size
        
        for j, (path, transcript) in enumerate(batch_data):
            X[j] = np.load(path + '.X.npy')
            y[j] = encode(transcript)

        X_pad = pad_sequences(X, padding='post', value=c.masking_value, dtype=np.float32)
        y_pad = pad_sequences(y, padding='post', value=0, dtype=np.float32)

        input_length = np.reshape(np.array([e.shape[0] for e in X]), (batch_size, 1))
        label_length = np.reshape(np.array([e.shape[0] for e in y]), (batch_size, 1))

        inputs = {'input':X_pad, 'the_labels':y_pad, 'input_length':input_length, 'label_length':label_length}

        outputs = {'ctc': np.zeros((batch_size, 1))}

        yield inputs, outputs

        i += 1
