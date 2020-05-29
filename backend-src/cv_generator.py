import numpy as np
import pandas as pd
from tensorflow.keras.preprocessing.sequence import pad_sequences
from tensorflow.keras.utils import to_categorical

import os

import constants as c
from text import encode
from features import get_features
from decorators import timeit

def generator(data_type='train', batch_size=c.batch_size):

    data = pd.read_csv(os.path.join('CV', f'cv_{data_type}.csv')).to_numpy()
    np.random.shuffle(data)
    steps_per_epoch = int(np.ceil(data.shape[0]/batch_size))
    i = 0

    while True:
        if i==steps_per_epoch:
            i = 0
            np.random.shuffle(data)

        batch_data = data[i*batch_size:(i+1)*batch_size]
        
        X = [''] * int(batch_data.shape[0])
        _y = [''] * int(batch_data.shape[0])
        
        for j, (path, transcript) in enumerate(batch_data):    
            X[j] = get_features(np.load(path + '.npy'))
            _y[j] = encode(c.start_token + transcript + c.end_token)

        X = pad_sequences(X, padding='post', value=c.masking_value, dtype=np.float32, maxlen=c.max_X_seq_len)
        _y = pad_sequences(_y, padding='post', value=encode(c.pad_token)[0], dtype=np.float32, maxlen=c.max_y_seq_len)

        y = np.zeros((_y.shape[0], _y.shape[1], c.n_output), dtype=np.float32)
        
        for j in range(y.shape[0]):
            y[j] = to_categorical(_y[j], num_classes=c.n_output)

        del _y
        
        y_lag = y.copy()
        y_lag = np.delete(y_lag, 0, 1)
        pad = np.reshape([to_categorical(encode(c.pad_token)[0], num_classes=c.n_output)]*y.shape[0], (y.shape[0], 1, -1))
        y_lag = np.append(y_lag, pad, 1)

        yield [X, y], y_lag

        i += 1
