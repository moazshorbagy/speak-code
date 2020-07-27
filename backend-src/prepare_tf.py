#!/usr/bin/env pythonmport errno
import os

import constants as c
from decorators import timeit

import numpy as np
import pandas as pd
import librosa

@timeit
def prepare_data():
    target = "TF"

    print("Building CSVs")

    # Lists to build CSV files
    list_wavs, list_trans = [], []
    
    dirs = os.listdir(target)

    for directory in dirs:
        print(directory)
        for filename in os.listdir(os.path.join(target, directory)):
            if(filename.endswith('.wav')):
                wav_path = os.path.join(target, directory, filename)

                list_wavs.append(wav_path)
                list_trans.append(directory)

                if(os.path.exists(wav_path + '.npy')):
                    continue                
                # making a numpy file with sampled wav file
                y, sr = librosa.load(wav_path, sr=c.sample_rate)
                np.save(wav_path + '.npy', y)

    a = {
        "wav_filename": list_wavs,
        "transcript": list_trans,
    }

    df_all = pd.DataFrame(
        a, columns=["wav_filename", "transcript"], dtype=int
    )

    df_all.to_csv(
        target + "/tf_all.csv", sep=",", header=True, index=False, encoding="ascii"
    )

if __name__ == "__main__":
    print('This might take a few hours..')
    prepare_data()
    print("Data preparation completed")
