import numpy as np
import pandas as pd
import librosa
import re
from sklearn.model_selection import train_test_split

import os

import constants as c
from text import encode, decode
from features import get_features
from decorators import timeit


def load_txt_file(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        return f.readline()

@timeit
def create_dataset():

    train = pd.read_csv(os.path.join('TIMIT', 'timit_train.csv')).to_numpy()

    X_train = [''] * int(train.shape[0])
    y_train = [''] * int(train.shape[0])

    for i, (path, size, transcript) in enumerate(train):

        X_train[i] = np.reshape(get_features(np.load(path + '.npy'))[0], (-1, c.n_mfcc))
        y_train[i] = encode(transcript)

    X_train = np.array(X_train)
    y_train = np.array(y_train)

    np.save('X_train.npy', X_train)
    np.save('y_train.npy', X_train)

    return X_train, y_train

@timeit
def create_testset():

    test = pd.read_csv(os.path.join('TIMIT', 'timit_test.csv')).to_numpy()

    X_test = [''] * int(test.shape[0])
    y_test = [''] * int(test.shape[0])

    for i, (path, size, transcript) in enumerate(test):

        X_test[i] = np.reshape(get_features(np.load(path + '.npy'))[0], (-1, c.n_mfcc))
        y_test[i] = encode(transcript)

    X_test = np.array(X_test)
    y_test = np.array(y_test)

    np.save('X_test.npy', X_test)
    np.save('y_test.npy', X_test)

    return X_test, y_test

def text_processing(text):
    return re.sub(r'[.!,\n\'\"]'," ",text)



# Check data generators
# https://stanford.edu/~shervine/blog/keras-how-to-generate-data-on-the-fly
