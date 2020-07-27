import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from tensorflow.keras.preprocessing.sequence import pad_sequences
from tensorflow.keras.utils import to_categorical

import os

import constants as c
from text import encode
from features import get_features
from decorators import timeit

@timeit
def create_dataset(dataset='TIMIT'):

    data = pd.read_csv(os.path.join(dataset, f'{dataset.lower()}_all.csv')).to_numpy()

    X = [''] * int(data.shape[0])
    _y = [''] * int(data.shape[0])

    for i, (path, transcript) in enumerate(data):
        
        X[i] = get_features(np.load(path + '.npy'))
        _y[i] = encode(c.start_token + transcript + c.end_token)

    X = pad_sequences(X, padding='post', value=c.masking_value, dtype=np.float32)
    _y = pad_sequences(_y, padding='post', value=encode(c.pad_token)[0], dtype=np.float32)

    y = np.zeros((_y.shape[0], _y.shape[1], c.n_output), dtype=np.float32)
    
    for i in range(y.shape[0]):
        y[i] = to_categorical(_y[i], num_classes=c.n_output)

    y_lag = y.copy()
    y_lag = np.delete(y_lag, 0, 1)
    pad = np.reshape([to_categorical(encode(c.pad_token)[0], num_classes=c.n_output)]*y.shape[0], (y.shape[0], 1, -1))
    y_lag = np.append(y_lag, pad, 1)

    return X, y, y_lag
