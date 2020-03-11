import numpy as np
import scipy.io.wavfile as wav
import matplotlib.pyplot as plt

pre_emphasis=0.97
frame_duration=0.025 #in seconds
frame_overlap=0.01   #in seconds

sampling_rate,signal=wav.read("OSR_us_000_0010_8k.wav")
signal=signal[0:sampling_rate*3] # 3 seconds


# ------------------- Pre-Emphasis ------------------------
emphasized_signal = np.append(signal[0], signal[1:] - pre_emphasis * signal[:-1])


# ------------------- Framing -----------------------------
samples_per_frame=int(frame_duration*sampling_rate)

start_indices=np.arange(int(samples_per_frame-frame_overlap),len(emphasized_signal),int(sampling_rate*(frame_duration-frame_overlap)))
indices=np.tile(np.arange(0,int(samples_per_frame)),(len(start_indices),1))
array_of_indices=indices+np.reshape(start_indices,(len(start_indices),1))

added_zeros=abs(len(emphasized_signal)-array_of_indices[-1][-1])
emphasized_signal=np.append(emphasized_signal,np.zeros((1,added_zeros+1)))

frames=np.vstack([emphasized_signal[0:int(samples_per_frame)],emphasized_signal[array_of_indices]])

# ------------------- windowing ----------------------------
window_length=samples_per_frame
time_axis=np.arange(0,window_length)

hamming_Window=0.54-(0.46*np.cos(2*np.pi*time_axis/(window_length-1)))
frames=np.multiply(frames,hamming_Window)


# ------------------- Short time fourier transform ----------
fourier_terms=np.fft.rfft(frames)
magnitude=np.absolute(fourier_terms)
pow_spectrum=magnitude**2
