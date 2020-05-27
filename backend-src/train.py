import constants as c
from dataset import create_dataset
from tensorflow.keras.utils import plot_model
from visualization import plot_accuracy, plot_loss
from model import create_model, create_optimizer, create_loss_function

if __name__=="__main__":
    
    X, y, y_lag = create_dataset()

    full_model, encoder_model, decoder_model = create_model(X.shape[1], y.shape[1])

    full_model.summary()

    optimizer = create_optimizer()

    loss = create_loss_function()

    full_model.compile(loss='categorical_crossentropy', optimizer=optimizer, metrics=['accuracy'])
    
    plot_model(encoder_model, to_file='encoder_model.png', show_shapes=True)
    plot_model(decoder_model, to_file='decoder_model.png', show_shapes=True)
    plot_model(full_model, to_file='full_model.png', show_shapes=True)

    history = full_model.fit(
        [X, y],
        y_lag,
        batch_size=c.batch_size,
        epochs=100,
        validation_split=0.2,
        shuffle=True,
        initial_epoch=0
        )

    plot_accuracy(history)
    plot_loss(history)

    full_model.save_weights("full_model.h5")
    encoder_model.save_weights("encoder_model.h5")
    decoder_model.save_weights("decoder_model.h5")
    
    return full_model, encoder_model, decoder_model