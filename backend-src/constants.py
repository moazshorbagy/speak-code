start_token = '@'
end_token = '!'
pad_token = '*'

alphabet = [pad_token, 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', ' ', start_token, end_token]
masking_value = -900.

# Sound Processing

sample_rate       = 16000       # sample rate value expected by model
pre_emphasis      = 0.97
frame_duration    = 0.010       #in seconds
frame_overlap     = 0.005       #in seconds
n_filters         = 40
n_context         = 3           # number of context frames (overlapped frames)
add_context       = False
with_deltas       = True


if(sample_rate == 8000):
    n_mfcc = 14
elif(sample_rate == 16000):
    n_mfcc = 14
else:
    raise(ValueError('sample_rate is not 8000 or 16000'))

# Geometry

max_X_seq_len = 784     # Only used for Common Voice dataset
max_y_seq_len = 77      # Only used for Common Voice dataset

n_input  = n_mfcc*3 if with_deltas else n_mfcc
n_input  = n_input+(2*n_context*n_input) if add_context else n_input

n_output = len(alphabet)

n_cell_dim = 256       # dimension of GRU state cell

# Global Constants

epochs = 10               # an epoch is an iteration over the entire x and y data provided
batch_size = 42          # number of samples per gradient update.
validation_split = 0.2  # fraction of the training data to be used as validation data
dropout=0.2

# parameter for beam search
beam_width=1
alpha_1=1e-2

# Adam Optimizer

learning_rate = 1e-4
beta_1 = 0.9
beta_2 = 0.999

lr_decay_epoch = 100
minimum_lr = 1e-5

# General

checkpoint_filepath = 'tmp/checkpoint'
