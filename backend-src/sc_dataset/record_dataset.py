import struct
import os
import shutil
import numpy as np
import pandas as pd
import speech_recognition as sr
import librosa

if(not os.path.exists('SC')):
    os.mkdir('SC')
    os.mkdir(os.path.join('SC', 'train'))
    shutil.move('sc_train.csv', os.path.join('SC', 'sc_train.csv'))

user_name = input('Enter your first name (one word): ')
user_name = user_name if user_name != '' else 'unkown'

chunk_size = 1000  # Record in chunks of 1000 samples
sample_rate = 16000

recognizer = sr.Recognizer()
microphone = sr.Microphone(sample_rate=sample_rate, chunk_size=chunk_size)

train = pd.read_csv(os.path.join('SC', 'sc_train.csv'))

try:
    i = int(input('Enter start index: '))
    if i < 0:
        raise ValueError
except:
    i = 0

with microphone as source:
    recognizer.adjust_for_ambient_noise(source)

    try:
        while i < train.shape[0]:
            
            print()
            print('Text %d:'%i, train['text'][i])

            print("Listening..")
            audio = recognizer.listen(source)

            print("Saving..")
            
            # calculating the samples
            raw = audio.get_wav_data()
            fmt = "%dh" % (len(raw) // 2)
            frames_unpacked = struct.unpack(fmt, raw)

            samples = np.array(frames_unpacked)[50:] / 32768.0
            
            filename = train['filename'][i].split('.')[0] + '.' + user_name + '.wav'
            
            librosa.output.write_wav(filename, samples, sr=sample_rate)
            
            user_input = input('Do you want to proceed, repeat or exit (p/r/e)? ')
            
            if(user_input in ['p', 'P', 'proceed', 'yes', '']):
                i += 1
            if(user_input in ['e', 'E', 'exit']):
                i += 1
                break
    
    except KeyboardInterrupt:
        pass

if(i>=train.shape[0]):
    shutil.make_archive('SC', 'zip', 'SC')

print('Completed')
