import numpy as np
import pandas as pd
from tensorflow.keras.preprocessing.sequence import pad_sequences
from tensorflow.keras.utils import to_categorical

import os
import librosa
import constants as c
from text import encode
from features import get_features,apply_lift,delta
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


def generator_compiled(data_type='train', batch_size=c.batch_size):
    data = pd.read_csv(os.path.join('CV', f'cv_{data_type}.csv')).to_numpy()
    np.random.shuffle(data)
    steps_per_epoch = int(np.ceil(data.shape[0]/batch_size))
    i = 0

    while True:
        if i==steps_per_epoch:
            i = 0
            np.random.shuffle(data)

        batch_data = data[i*batch_size:(i+1)*batch_size]

        X = np.zeros((batch_size, c.max_X_seq_len, c.n_input))
        y = np.zeros((batch_size, c.max_y_seq_len, c.n_output))
        y_lag = np.zeros((batch_size, c.max_y_seq_len, c.n_output))

        for j, (path, _) in enumerate(batch_data):
            X[j] = np.load(path + '.X.npy')
            y[j], y_lag[j] = np.load(path + '.y.npy')

        yield [X, y], y_lag

        i += 1


def generator_compiled_no_pad(data_type='train', batch_size=c.batch_size):
    data = pd.read_csv(os.path.join('CV_16', f'cv_{data_type}.csv')).to_numpy()
    np.random.shuffle(data)
    # data=sort_data(data)
    steps_per_epoch = data.shape[0] // batch_size
    i = 0

    while True:
        if i==steps_per_epoch:
            i = 0
            np.random.shuffle(data)

        batch_data = data[i*batch_size:(i+1)*batch_size]

        X = [''] * int(batch_size)
        _y = [''] * int(batch_size)

        for j, (path, transcript) in enumerate(batch_data):
            mfcc = np.load(path + '.X.npy')
            delta_1=delta(mfcc,2)
            delta_2=delta(delta_1,2)
            X[j] = np.concatenate([mfcc,delta_1,delta_2],axis=-1)
            _y[j] = encode(c.start_token + transcript + c.end_token)

        X = pad_sequences(X, padding='post', value=c.masking_value, dtype=np.float32)
        _y = pad_sequences(_y, padding='post', value=encode(c.pad_token)[0], dtype=np.float32)

        y = np.zeros((batch_size, _y.shape[1], c.n_output), dtype=np.float32)

        for j in range(batch_size):
            y[j] = to_categorical(_y[j], num_classes=c.n_output)

        y_lag = y.copy()
        y_lag = np.delete(y_lag, 0, 1)
        pad = np.reshape([to_categorical(encode(c.pad_token)[0], num_classes=c.n_output)]*batch_size, (batch_size, 1, -1))
        y_lag = np.append(y_lag, pad, 1)

        yield [X, y], y_lag

        i += 1

def generator_Timit(data_type='train', batch_size=c.batch_size):
    data = pd.read_csv(os.path.join('timit', f'timit_{data_type}.csv')).to_numpy()
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
            mfcc=get_features(np.load(path + '.npy'))
            delta_1=delta(mfcc,2)
            delta_2=delta(delta_1,2)
            X[j] = np.concatenate([mfcc,delta_1,delta_2],axis=-1)
            _y[j] = encode(c.start_token + transcript + c.end_token)

        X = pad_sequences(X, padding='post', value=c.masking_value, dtype=np.float32)
        _y = pad_sequences(_y, padding='post', value=encode(c.pad_token)[0], dtype=np.float32)

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

def generator_Sc(batch_size=c.batch_size):
    data = pd.read_csv(os.path.join('SC', f'sc_train.csv')).to_numpy()
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
            mfcc=get_features(librosa.load(path,sr=c.sample_rate))
            delta_1=delta(mfcc,2)
            delta_2=delta(delta_1,2)
            X[j] = np.concatenate([mfcc,delta_1,delta_2],axis=-1)
            _y[j] = encode(c.start_token + transcript + c.end_token)

        X = pad_sequences(X, padding='post', value=c.masking_value, dtype=np.float32)
        _y = pad_sequences(_y, padding='post', value=encode(c.pad_token)[0], dtype=np.float32)

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


def sort_data(array):
    z=np.char.str_len(array[:,1].astype(str))
    ind=np.argsort(z,axis=0)
    return array[ind]
