import struct
import numpy as np
import tensorflow as tf
import speech_recognition as sr
from tensorflow.keras.models import Model
from tensorflow.keras import backend as k

from model import create_model, create_optimizer
from BeamSearch import ctcBeamSearch
from features import get_features
import constants as c

model = create_model()
optimizer = create_optimizer()
loss = {'ctc': lambda y_true, y_pred: y_pred}
model.compile(loss=loss, optimizer=optimizer, metrics=['accuracy'])
model.load_weights('model.h5')

sub_model = Model(inputs=model.get_layer('masking_layer').input, outputs=model.get_layer('output_layer').output)

chunk_size = 1000  # Record in chunks of 1000 samples

recognizer = sr.Recognizer()
microphone = sr.Microphone(sample_rate=c.sample_rate, chunk_size=chunk_size)

with microphone as source:
    recognizer.adjust_for_ambient_noise(source)

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

            # predicting the words using our model

            d = np.array([feats])

            prediction=sub_model.predict(d)
            output = k.get_value(prediction)        
            path = ctcBeamSearch(output[0], ''.join(c.alphabet), None)

            print('pred:', path)
    
    except KeyboardInterrupt:
        pass