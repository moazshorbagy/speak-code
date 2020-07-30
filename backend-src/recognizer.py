import speech_recognition as sr

import zerorpc
import time

client = zerorpc.Client(heartbeat=30000, timeout=10000)
client.connect("tcp://127.0.0.1:4242")

recognizer = sr.Recognizer()

with sr.Microphone() as source:
    while True:
        print("Listening..")
        audio = recognizer.listen(source)
        print("Recognizing..")
        
        try:
            words = recognizer.recognize_google(audio)
        except sr.UnknownValueError:
            print("Unable to recognize speech")
            continue

        words = words.lower()
        print(words)
        client.sendData(words)

        