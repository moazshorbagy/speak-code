# Does the dataset have numbers or any special characters in it?

import numpy as np

import constants as c

# Creating a mapping from unique characters to indices
char2idx = {u:i for i, u in enumerate(c.alphabet)}

# Creating a mapping from indices characters to unique characters
idx2char = np.array(c.alphabet)

def encode(text):
    if(type(text) not in [str]):
        raise TypeError('The type of text to be encoded should be str')

    return np.array([char2idx[c] for c in text])

def decode(label_vector):
    if(type(label_vector) in [str, int, float, dict]):
        raise TypeError('The input type is incorrect')

    return ''.join([idx2char[idx] for idx in label_vector])

def encode_to_one_hot(char):
    z=np.zeros((1,1,c.n_output))
    z[0,0,c.alphabet.index(char)]=1
    return np.array(z)

def decode_from_one_hot(vector):
    return c.alphabet[np.where(vector==1)[0][0]]
