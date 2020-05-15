import numpy as np
from tensorflow.keras.preprocessing.sequence import pad_sequences

import constants as c

def generator(X_train, Y_train, batch_size):

    i = 0
    steps_per_epoch   =   int(np.ceil(X_train.shape[0]/batch_size))
    X_train =   np.array(np.array_split(X_train, steps_per_epoch))
    Y_train =   np.array(np.array_split(Y_train, steps_per_epoch))

    while True:
        if i==steps_per_epoch:
            i=0

        x_train         =   X_train[i].copy()
        y_train         =   Y_train[i].copy()

        x_train         =   pad_sequences(x_train, padding='post', value=c.masking_value, dtype=np.float64)
        y_train         =   pad_sequences(y_train, padding='post', value=c.number_of_char, dtype=np.float64)

        input_length    =   np.reshape(np.array([x.shape[0] for x in X_train[i]]), (x_train.shape[0], 1))
        label_length    =   np.reshape(np.array([y.shape[0] for y in Y_train[i]]), (y_train.shape[0], 1))

        inputs          =   {'input':x_train, 'the_labels':y_train, 'input_length':input_length, 'label_length':label_length}

        outputs         =   {'ctc': np.zeros((x_train.shape[0], 1))}

        i += 1

        yield inputs, outputs
