# Does the dataset have numbers or any special characters in it?

import numpy as np

import constants as c

# Creating a mapping from unique characters to indices
char2idx = {u:i for i, u in enumerate(c.alphabet)}

# Creating a mapping from indices characters to unique characters
idx2char = np.array(c.alphabet)

def encode(text):
    return np.array([char2idx[c] for c in text])

def decode(label_vector):
    return ''.join([idx2char[idx] for idx in label_vector])
