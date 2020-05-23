import librosa
import numpy as np
import pandas as pd
from tqdm import tqdm

import constants as c
from text import encode, decode
from features import get_features

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
train = train[vlen(train[:, 1]) < 30]
test = test[vlen(test[:, 1]) < 30]
dev = dev[vlen(dev[:, 1]) < 30]

train = pd.DataFrame(train, columns=columns)
test = pd.DataFrame(test, columns=columns)
dev = pd.DataFrame(dev, columns=columns)

data = pd.concat([train, test, dev])

os.remove('CV/cv-valid-train.csv')
os.remove('CV/cv-valid-test.csv')
os.remove('CV/cv-valid-dev.csv')

train.to_csv("CV/cv_train.csv", sep=",", header=True, index=False, encoding="ascii")
test.to_csv("CV/cv_test.csv", sep=",", header=True, index=False, encoding="ascii")
dev.to_csv("CV/cv_dev.csv", sep=",", header=True, index=False, encoding="ascii")
data.to_csv("CV/cv_all.csv", sep=",", header=True, index=False, encoding="ascii")

def convert(f_path):
    print(f_path)
    samples, sr = librosa.load(f_path, sr=c.sample_rate)
    np.save(f_path + '.npy', samples)

vconvert = np.vectorize(convert)

vconvert(data['filename'])