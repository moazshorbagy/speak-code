from model import create_model, create_optimizer, create_model_checkpoint_cb, create_lr_scheduler_cb
from visualization import plot_accuracy, plot_loss
from BeamSearch import ctcBeamSearch
from dataset import create_dataset
from generator import generator
from text import decode
import constants as c

from tensorflow.keras.utils import plot_model
from tensorflow.keras import backend as k
from tensorflow.keras.models import Model
import numpy as np


def train():

    X_train, X_test, y_train, y_test = create_dataset()

    model = create_model()

    model.summary()

    plot_model(model, to_file='rnn.png')

    optimizer = create_optimizer()

    loss = {'ctc': lambda y_true, y_pred: y_pred}

    model.compile(loss=loss, optimizer=optimizer, metrics=['accuracy'])

    history = model.fit(
        generator(X_train, y_train, c.batch_size),
        steps_per_epoch=int(np.ceil(X_train.shape[0]/c.batch_size)),
        epochs=c.epochs,
        validation_data=generator(X_test, y_test, c.batch_size),
        validation_steps=int(np.ceil(X_test.shape[0]/c.batch_size)),
        callbacks=[create_model_checkpoint_cb(), create_lr_scheduler_cb()]
        )
    
    plot_accuracy(history)
    plot_loss(history)
    
    model.load_weights(c.checkpoint_filepath)
    model.save('model.h5')

    sub_model = Model(inputs=model.get_layer('masking_layer').input, outputs=model.get_layer('output_layer').output)

    for i in range(15):
        data = X_test[i]
        d = np.array([data])
        
        prediction=sub_model.predict(d)
        output = k.get_value(prediction)        
        path = ctcBeamSearch(output[0], ''.join(c.alphabet), None)

        print('true:', decode(y_test[i]))
        print('pred:', path)
        print()


if(__name__ == "__main__"):
    train()
