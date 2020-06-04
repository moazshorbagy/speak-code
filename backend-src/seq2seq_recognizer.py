import struct
import numpy as np
import tensorflow as tf
import speech_recognition as sr
from tensorflow.keras.models import Model
from tensorflow.keras.preprocessing.sequence import pad_sequences

from model import create_model, create_optimizer, create_loss_function, predict
from features import get_features
import constants as c

full_model, encoder_model, decoder_model = create_model(c.max_X_seq_len, c.max_y_seq_len)
optimizer = create_optimizer()
loss = create_loss_function()
full_model.compile(loss='categorical_crossentropy', optimizer=optimizer, metrics=['accuracy'])
full_model.load_weights('model/full_model.h5')

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
            X = np.array([feats])

            # predicting the words using our model
            X = pad_sequences(X, padding='post', value=c.masking_value, dtype=np.float32, maxlen=c.max_X_seq_len)

            prediction = predict(encoder_model, decoder_model, X, beam_search=True)[0]

            print('pred:', prediction)
            print()
    
    except KeyboardInterrupt:
        pass