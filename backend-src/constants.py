import os


alphabet = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', ' ']
masking_value = -10000
number_of_char = len(alphabet)
# Sound Processing

sample_rate = 8000  # sample rate value expected by model
n_mels = 40
with_deltas = False

if(sample_rate == 8000):
    n_mfcc = 13
elif(sample_rate == 16000):
    n_mfcc = 26
else:
    raise(ValueError('sample_rate is not 8000 or 16000'))

# Geometry

n_input = n_mfcc*3 if with_deltas else n_mfcc       # number of features at each time step

n_cell_dim = 512        # dimension of lstm state cell

n_hidden_1 = 512                # number of units in layer 1
n_hidden_2 = n_hidden_1         # number of units in layer 2
n_hidden_3 = n_cell_dim         # number of units in layer 3
n_hidden_4 = n_cell_dim         # number of units in layer 4
n_hidden_5 = n_hidden_1         # number of units in layer 5
n_hidden_6 = number_of_char+1    # number of units in layer 6 (output layer) (+1 for CTC blank label)

n_steps = None          # sequence length

# Global Constants

epochs = 70             # an epoch is an iteration over the entire x and y data provided
batch_size = 10          # number of samples per gradient update.
validation_split = 0.2  # fraction of the training data to be used as validation data

dropout_1 = 0.1     # dropout rate for layer 1
dropout_2 = 0.1     # dropout rate for layer 2
dropout_3 = 0.1     # dropout rate for layer 3
dropout_4 = 0.2     # dropout rate for layer 4
dropout_5 = 0.1     # dropout rate for layer 5

n_context = 9       # number of context frames (overlapped frames)
relu_clip = 20.0    # ReLU clipping value for non-recurrent layers

# Adam Optimizer

learning_rate = 0.001
beta_1 = 0.9
beta_2 = 0.999

# Files

train_audio_path = os.path.join('audio', 'train')
test_audio_path = os.path.join('audio', 'test')
