import numpy as np
import scipy.fftpack
import constants as c

def get_features(signal):
    """
    return the required features for trainning, mainly mfcc

    :parameter signal  : signal to find the features for it

    :return mfcc       : mfcc features
    """

    emphasized_signal   = pre_emphasis(signal)
    frames              = framing(signal,c.sample_rate,c.frame_duration,c.frame_overlap,np.hamming)
    pow_spec,freq_axis  = pow_spectrum(frames,N=512)
    fbanks              = filter_banks(c.sample_rate,freq_axis)
    mfcc                = np.dot(pow_spec,fbanks.T)
    mfcc                = np.where(mfcc==0,np.finfo(np.float).eps,mfcc)  # replace 0 with small value to apply log
    mfcc                = np.log(mfcc)
    mfcc                = scipy.fftpack.dct(mfcc, type=2, axis=1, norm='ortho')
    mfcc               -= (np.mean(mfcc, axis=0) + 1e-8)
    mfcc                = mfcc[:,1:c.n_mfcc+1]

    # this part add context frames to the mfcc features
    if c.add_context:
        dummy_array = np.zeros((c.n_context,c.n_mfcc),dtype=mfcc.dtype)
        mfcc_temp   = np.concatenate((dummy_array,mfcc,dummy_array),axis=0).ravel()
        mfcc        = np.lib.stride_tricks.as_strided(  mfcc_temp,
                                                        shape=(mfcc.shape[0],c.n_input),
                                                        strides=(c.n_mfcc*mfcc.itemsize,mfcc.itemsize))

    return mfcc


def pre_emphasis(signal):
    """
    Apply pre_emphasis to the signal to increase the magnitude of the high frequency components

    :parameter : required signal
    :return    : filter signal
    """

    return np.append(signal[0], signal[1:] - c.pre_emphasis * signal[:-1])

def framing(signal,sample_rate,frame_duration,frame_overlap,window_func):
    """
    divide the signal into frames and apply input function to every frame

    :parameter signal           : the signal that will be divided
    :parameter Sample_rate      : the sampling rate of this signal
    :parameter frame_duration   : the furation of output frames in seconds
    :parameter frame_overlap    : the overlap between every successive frames
    :parameter window_func      : window function to be applied on each frame

    :return frames              : required frames
    """
    samples_per_frame = int(frame_duration*sample_rate)
    start_indices = np.arange(samples_per_frame-int(frame_overlap*c.sample_rate),len(signal),int(sample_rate*(frame_duration-frame_overlap)))
    indices = np.tile(np.arange(0,int(samples_per_frame)),(len(start_indices),1))
    array_of_indices = indices+np.reshape(start_indices,(len(start_indices),1))

    added_zeros = abs(len(signal)-array_of_indices[-1][-1])
    r = np.append(signal,np.zeros((1,added_zeros+1)))

    frames = np.vstack([r[0:int(samples_per_frame)],r[array_of_indices]])
    frames *= window_func(samples_per_frame)
    return frames

def pow_spectrum(frames,N):
    """
    Find the power spectrum coefficient for each frame

    :parameter frames   : array of frames,each row represent frame
    :parameter N        : the length to use in FFT

    :return pow_spec        : the power spectrum coefficients for every frame
    :return frequency_axis  : the frequency axis with length N
    """
    fourier_terms = np.fft.rfft(frames,N)

    magnitude = np.absolute(fourier_terms)
    pow_spec=(1/N)*(magnitude)**2

    frequency_axis = np.fft.rfftfreq(N,1/c.sample_rate)
    return pow_spec,frequency_axis

def filter_banks(sample_rate,frequency_axis):
    """
    Return Mel filer banks matrix where each row represnt specific filter

    :parameter sample_rate      : the sample rate of the signal on which the filter bank will be applied
    :parameter frequency_axis   : the frequency axis form the pow_spectrum function

    :return fbank               : filer banks matrix where each row represnt specific filter

    """
    low_freq = 0
    high_freq = 2595*np.log10(1+((c.sample_rate/2)/700))
    mel_axis = np.linspace(low_freq,high_freq,c.n_filters+2)
    Melfreq_axis = 700*((10**(mel_axis/2595))-1)

    fbank = np.zeros((c.n_filters,len(frequency_axis)))

    for i in range(1,c.n_filters):
        freq_less = np.logical_and(frequency_axis<Melfreq_axis[i],frequency_axis>Melfreq_axis[i-1])
        freq_greater = np.logical_and(frequency_axis>Melfreq_axis[i],frequency_axis<Melfreq_axis[i+1])
        freq_equal = frequency_axis==Melfreq_axis[i]

        fbank[i-1,freq_less] = (frequency_axis[freq_less]-Melfreq_axis[i-1])/(Melfreq_axis[i]-Melfreq_axis[i-1])
        fbank[i-1,freq_greater] = (Melfreq_axis[i+1]-frequency_axis[freq_greater])/(Melfreq_axis[i+1]-Melfreq_axis[i])
        fbank[i-1,freq_equal] = 1

    return fbank
