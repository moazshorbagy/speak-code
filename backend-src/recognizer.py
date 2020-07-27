import struct
import numpy as np
import tensorflow as tf
import speech_recognition as sr
import constants as c
from model import Model
from features import get_features,delta
from tensorflow.keras.preprocessing.sequence import pad_sequences
import librosa

model=Model(True)

samples, sr = librosa.load('mo.wav', sr=c.sample_rate)
# calculating the features
feats = get_features(samples)
deltaaaa=delta(feats,2)
feats=np.concatenate([feats,deltaaaa,delta(deltaaaa,2)],axis=-1)

# predicting the words using our model

d = np.array([feats])
prediction=model.predict(d,2)

print('pred:', prediction)
