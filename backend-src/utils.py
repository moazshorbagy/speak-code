"""
Utility functions for audio files
"""
import librosa
from tqdm import tqdm
import numpy as np

import constants as c

# Creating a mapping from unique characters to indices
char2idx = {u:i for i, u in enumerate(c.alphabet)}

# Creating a mapping from indices characters to unique characters
idx2char = np.array(c.alphabet)

def wav_to_numpy(files, sr=8000):
    """
    Converts wav files to numpy arrays.
    """
    for file in tqdm(files):
        y, sr = librosa.load(file, sr=sr)
        np.save(file + '.npy', y)


if(__name__ == "__main__"):

    import pandas as pd
    import os

    print('Converting train files to numpy files..')
    train_files = pd.read_csv(os.path.join('TIMIT', 'timit_train.csv'))['wav_filename']
    wav_to_numpy(train_files, sr=c.sample_rate)
    
    print('Converting test files to numpy files..')
    test_files = pd.read_csv(os.path.join('TIMIT', 'timit_test.csv'))['wav_filename']
    wav_to_numpy(test_files, sr=c.sample_rate)
