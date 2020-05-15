from model import create_model, create_optimizer, create_loss_function
from generator import train_generator, test_generator
from dataset import create_dataset,create_testset
import constants as c
from tensorflow.keras.utils import plot_model
from tensorflow.keras import backend as k
from tensorflow.keras.models import Model
import numpy as np
from BeamSearch import ctcBeamSearch


def train():

    X_train, y_train,  = create_dataset()
    X_test, y_test     = create_testset()

    model = create_model()

    model.summary()

    #plot_model(model, to_file='rnn.png')

    optimizer = create_optimizer()

    loss = {'ctc': lambda y_true, y_pred: y_pred}

    model.compile(loss=loss ,optimizer=optimizer, metrics=['accuracy'])

    model.fit_generator(generator=train_generator(X_train, y_train,c.batch_size),steps_per_epoch=int(np.ceil(X_train.shape[0]/c.batch_size)), epochs=c.epochs)

    sub_model=Model(inputs=model.get_layer('masking_layer').input,outputs=model.get_layer('output_layer').output)

    for data in X_test:
        d=np.array([data])
        prediction=sub_model.predict(d)

        output=k.get_value(prediction)
        # test BeamSearch models
        path=ctcBeamSearch(output[0],''.join(c.alphabet),None)
        print(path)




if(__name__ == "__main__"):
    train()
