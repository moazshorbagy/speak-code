start_token = '@'
end_token = '!'
pad_token = '*'

alphabet = ['*', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', ' ', start_token, end_token]
masking_value = -900.

# Sound Processing

sample_rate       = 16000       # sample rate value expected by model
pre_emphasis      = 0.97
frame_duration    = 0.025       #in seconds
frame_overlap     = 0.015       #in seconds
n_filters         = 40

add_context       = False
n_context         = 3           # number of context frames (overlapped frames)

with_deltas       = False


if(sample_rate == 8000):
    n_mfcc = 13
elif(sample_rate == 16000):
    n_mfcc = 26
else:
    raise(ValueError('sample_rate is not 8000 or 16000'))

# Geometry

n_input         = n_mfcc+(2*n_context*n_mfcc) if add_context else n_mfcc
n_output = len(alphabet)

n_cell_dim = 100        # dimension of lstm state cell

# Global Constants

epochs = 20            # an epoch is an iteration over the entire x and y data provided
batch_size = 50         # number of samples per gradient update.
validation_split = 0.2  # fraction of the training data to be used as validation data

# Adam Optimizer

learning_rate = 0.0001
beta_1 = 0.9
beta_2 = 0.999

lr_decay_epoch = 100
minimum_lr = 1e-5

# General

checkpoint_filepath = 'tmp/checkpoint'
