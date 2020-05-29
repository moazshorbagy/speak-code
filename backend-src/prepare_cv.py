import os
import librosa
import numpy as np
import pandas as pd
from tqdm import tqdm

import constants as c
from text import encode, decode
from features import get_features

def _remove_long_X_sequences(df):
    
    cols = df.columns
    arr = df.to_numpy()
    new_arr = []

    for i in range(arr.shape[0]):
        X = get_features(np.load(arr[i, 0] + '.npy'))
        if(X.shape[0] <= c.max_X_seq_len):
            new_arr.append(arr[i])
    
    return pd.DataFrame(new_arr, columns=cols)

def _convert(f_path):
    if(not os.path.exists(f_path + '.npy')):
        print(f_path)
        samples, sr = librosa.load(f_path, sr=c.sample_rate)
        np.save(f_path + '.npy', samples)

_vconvert = np.vectorize(_convert)

def prepare_cv():
    train = pd.read_csv(os.path.join('CV', 'cv-valid-train.csv'))
    test = pd.read_csv(os.path.join('CV', 'cv-valid-test.csv'))
    dev = pd.read_csv(os.path.join('CV', 'cv-valid-dev.csv'))

    train = train[(train['up_votes']-train['down_votes']) > 1]

    columns = train.columns
    train = train.to_numpy()
    test = test.to_numpy()
    dev = dev.to_numpy()

    train[:, 0] = 'CV/' + train[:, 0]
    test[:, 0] = 'CV/' + test[:, 0]
    dev[:, 0] = 'CV/' + dev[:, 0]

    replace = np.vectorize(np.chararray.replace)
    train[:, 1] = replace(train[:, 1], "'", "")
    test[:, 1] = replace(test[:, 1], "'", "")
    dev[:, 1] = replace(dev[:, 1], "'", "")

    vlen = np.vectorize(len)
    train = train[vlen(train[:, 1]) <= c.max_y_seq_len-2]   # '-2' is for start and end token
    test = test[vlen(test[:, 1]) <= c.max_y_seq_len-2]
    dev = dev[vlen(dev[:, 1]) <= c.max_y_seq_len-2]

    train = pd.DataFrame(train, columns=columns)[['filename', 'text']]
    test = pd.DataFrame(test, columns=columns)[['filename', 'text']]
    dev = pd.DataFrame(dev, columns=columns)[['filename', 'text']]
    data = pd.concat([train, test, dev])

    _vconvert(data['filename'])

    train = _remove_long_X_sequences(train)
    test = _remove_long_X_sequences(test)
    dev = _remove_long_X_sequences(dev)

    data = pd.concat([train, test, dev])

    os.remove('CV/cv-valid-train.csv')
    os.remove('CV/cv-valid-test.csv')
    os.remove('CV/cv-valid-dev.csv')

    train.to_csv("CV/cv_train.csv", sep=",", header=True, index=False, encoding="ascii")
    test.to_csv("CV/cv_test.csv", sep=",", header=True, index=False, encoding="ascii")
    dev.to_csv("CV/cv_dev.csv", sep=",", header=True, index=False, encoding="ascii")
    data.to_csv("CV/cv_all.csv", sep=",", header=True, index=False, encoding="ascii")

if(__name__=="__main__"):
    prepare_cv()
