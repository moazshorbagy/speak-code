import numpy as np
import pandas as pd
import librosa
import re
from sklearn.model_selection import train_test_split
from tqdm import tqdm

import os

import constants as c
from text import encode, decode
from features import get_features
from decorators import timeit


@timeit
def create_dataset():

    data = pd.read_csv(os.path.join('TIMIT', 'timit_all.csv')).to_numpy()

    X = [''] * int(data.shape[0])
    y = [''] * int(data.shape[0])

    for i, (path, transcript) in enumerate(data):
        
        X[i] = get_features(np.load(path + '.npy'))
        y[i] = encode(transcript)
    
    X = np.array(X)
    y = np.array(y)

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=c.validation_split, shuffle=True)

    return X_train, X_test, y_train, y_test


# Check data generators
# https://stanford.edu/~shervine/blog/keras-how-to-generate-data-on-the-fly
