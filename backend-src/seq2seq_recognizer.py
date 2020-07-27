import struct
import numpy as np
import tensorflow as tf
import speech_recognition as sr
from tensorflow.keras.models import Model
from tensorflow.keras.preprocessing.sequence import pad_sequences

from model import Model
from features import get_features,delta
import constants as c
from correction import correction

import zerorpc
import time
import os

import os

client = zerorpc.Client(heartbeat=30000, timeout=32000)
client.connect("tcp://127.0.0.1:4242")

model=Model(os.path.dirname(os.path.abspath(__file__)), True)
recognizer = sr.Recognizer()
microphone = sr.Microphone(sample_rate=c.sample_rate, chunk_size=1024)


with microphone as source:
    recognizer.adjust_for_ambient_noise(source, duration=0.1)

    try:
        while True:
            print("Listening..")
            audio = recognizer.listen(source)

            print("Recognizing..")

            # calculating the samples
            raw = audio.get_wav_data()
            fmt = "%dh" % (len(raw) // 2)
            frames_unpacked = struct.unpack(fmt, raw)

            samples = np.array(frames_unpacked)[100:] / 32768.0

            # calculating the features
            feats = get_features(samples)
            delta_1=delta(feats,2)
            delta_2=delta(delta_1,2)
            X = np.concatenate([feats,delta_1,delta_2],axis=-1)
            X = np.array([X])

            # predicting the words using our model
            # X = pad_sequences(X, padding='post', value=c.masking_value, dtype=np.float32, maxlen=c.max_X_seq_len)

            prediction = model.predict(tf.convert_to_tensor(X),2)
            if len(prediction) > 80:
                continue

            # print('pred:', prediction[0:-1])
            words = prediction[0:-1].split(' ')
            print(words)
            pred = []
            for i in range(len(words)):
                if(len(words[i]) > 1):
                    pred.append(correction((words[i])))
            pred = [x for x in pred if x != '']
            s = ' '
            s = s.join(pred)
            client.sendData(s)
            # print()

    except KeyboardInterrupt:
        pass
