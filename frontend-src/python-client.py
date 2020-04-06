import zerorpc
import time

client = zerorpc.Client(heartbeat=30000, timeout=32000)
client.connect("tcp://127.0.0.1:4242")

waitToListen = True

# while waitToListen:
#     shouldStartListening = client.shouldStartListening()

#     if shouldStartListening:
#         waitToListen = False



while True:
    time.sleep(2)
    client.sendData('wtf man plz rito')
