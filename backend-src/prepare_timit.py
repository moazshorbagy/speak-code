#!/usr/bin/env python
"""
    NAME    : LDC TIMIT Dataset
    URL     : https://catalog.ldc.upenn.edu/ldc93s1
    HOURS   : 5
    TYPE    : Read - English
    AUTHORS : Garofolo, John, et al.
    TYPE    : LDC Membership
    LICENCE : LDC User Agreement
"""

import fnmatch
import os
from os import path

import constants

import pandas as pd
import numpy as np
import librosa
from tqdm import tqdm


def clean(word):
    # LC ALL & strip punctuation which are not required
    new = word.lower()
    new = new.replace("'", "")
    new = new.replace(".", "")
    new = new.replace(",", "")
    new = new.replace(";", "")
    new = new.replace('"', "")
    new = new.replace("!", "")
    new = new.replace("?", "")
    new = new.replace(":", "")
    new = new.replace("-", "")
    return new


def prepare_timit():

    # SA sentences are repeated throughout by each speaker therefore can be removed for ASR as they will affect WER
    # We are ignoring SA sentences (2 x sentences which are repeated by all speakers)

    target = "TIMIT"

    print("Building CSVs")

    # Lists to build CSV files
    train_list_wavs, train_list_trans = [], []
    test_list_wavs, test_list_trans = [], []

    for root, dirnames, filenames in os.walk(target):
        for filename in [n for n in filenames if fnmatch.fnmatchcase(n, '*.wav')]:
            full_wav = os.path.join(root, filename)

            # need to remove .WAV.wav (8chars) then add .TXT
            trans_file = full_wav[:-8] + ".TXT"
            with open(trans_file, "r") as f:
                for line in f:
                    split = line.split()
                    start = split[0]
                    end = split[1]
                    t_list = split[2:]
                    trans = ""

                    for t in t_list:
                        trans = trans + " " + clean(t)

            if not ("SA" in os.path.basename(full_wav)):

                if "train" in full_wav.lower():
                    train_list_wavs.append(full_wav)
                    train_list_trans.append(trans)
                elif "test" in full_wav.lower():
                    test_list_wavs.append(full_wav)
                    test_list_trans.append(trans)
                else:
                    raise IOError

    a = {
        "wav_filename": train_list_wavs,
        "transcript": train_list_trans,
    }

    c = {
        "wav_filename": test_list_wavs,
        "transcript": test_list_trans,
    }

    all = {
        "wav_filename": train_list_wavs + test_list_wavs,
        "transcript": train_list_trans + test_list_trans,
    }

    df_all = pd.DataFrame(
        all, columns=["wav_filename", "transcript"], dtype=int
    )
    df_train = pd.DataFrame(
        a, columns=["wav_filename", "transcript"], dtype=int
    )
    df_test = pd.DataFrame(
        c, columns=["wav_filename", "transcript"], dtype=int
    )

    df_all.to_csv(
        target + "/timit_all.csv", sep=",", header=True, index=False, encoding="ascii"
    )
    df_train.to_csv(
        target + "/timit_train.csv", sep=",", header=True, index=False, encoding="ascii"
    )
    df_test.to_csv(
        target + "/timit_dev.csv", sep=",", header=True, index=False, encoding="ascii"
    )

    print('Converting wav files to numpy files..')

    for f_path in tqdm(df_all['wav_filename']):
        samples, sr = librosa.load(f_path, sr=constants.sample_rate)
        np.save(f_path + '.npy', samples)


if __name__ == "__main__":
    prepare_timit()
    print("Completed")
