import numpy as np
import scipy.io.wavfile as wav
import matplotlib.pyplot as plt
import scipy.fftpack

pre_emphasis = 0.97
frame_duration = 0.025 #in seconds
frame_overlap = 0.015   #in seconds

sampling_rate,signal = wav.read("OSR_us_000_0010_8k.wav")
signal = signal[0:3 * sampling_rate] # 3 seconds

samples_per_frame = int(frame_duration*sampling_rate)

# ------------------- Pre-Emphasis ------------------------
emphasized_signal = np.append(signal[0], signal[1:] - pre_emphasis * signal[:-1])


# ------------------- Framing -----------------------------

start_indices = np.arange(samples_per_frame-int(frame_overlap*sampling_rate),len(emphasized_signal),int(sampling_rate*(frame_duration-frame_overlap)))
indices = np.tile(np.arange(0,int(samples_per_frame)),(len(start_indices),1))
array_of_indices = indices+np.reshape(start_indices,(len(start_indices),1))

added_zeros = abs(len(emphasized_signal)-array_of_indices[-1][-1])
emphasized_signal = np.append(emphasized_signal,np.zeros((1,added_zeros+1)))

frames = np.vstack([emphasized_signal[0:int(samples_per_frame)],emphasized_signal[array_of_indices]])
# ------------------- windowing ----------------------------
frames*=np.hamming(samples_per_frame)

# ------------------- Short time fourier transform ----------
# number of points in fourier transform
N = 512

fourier_terms = np.fft.rfft(frames,N)

magnitude = np.absolute(fourier_terms)
pow_spectrum=(1/N)*(magnitude)**2

frequency_axis = np.fft.rfftfreq(N,1/sampling_rate)


# ------------------- Apply MelFilter Bank ------------------
nfilter = 40      # number of filters
low_freq = 0
high_freq = 2595*np.log10(1+((sampling_rate/2)/700))
mel_axis = np.linspace(low_freq,high_freq,nfilter+2)
Melfreq_axis = 700*((10**(mel_axis/2595))-1)

fbank = np.zeros((nfilter,len(frequency_axis)))

for i in range(1,nfilter):
    freq_less = np.logical_and(frequency_axis<Melfreq_axis[i],frequency_axis>Melfreq_axis[i-1])
    freq_greater = np.logical_and(frequency_axis>Melfreq_axis[i],frequency_axis<Melfreq_axis[i+1])
    freq_equal = frequency_axis==Melfreq_axis[i]

    fbank[i-1,freq_less] = (frequency_axis[freq_less]-Melfreq_axis[i-1])/(Melfreq_axis[i]-Melfreq_axis[i-1])
    fbank[i-1,freq_greater] = (Melfreq_axis[i+1]-frequency_axis[freq_greater])/(Melfreq_axis[i+1]-Melfreq_axis[i])
    fbank[i-1,freq_equal] = 1

fbank_output = np.dot(pow_spectrum,fbank.T)
fbank_output = np.where(fbank_output==0,np.finfo(np.float).eps,fbank_output)
fbank_output = 20 * np.log10(fbank_output)

mfcc= scipy.fftpack.dct(fbank_output, type=2, axis=1, norm='ortho')[:,1:13]
print(mfcc)
