import zerorpc
import time

client = zerorpc.Client(heartbeat=30000, timeout=32000)
client.connect("tcp://127.0.0.1:4242")


client.sendData('swhile')

# client.sendData('cond')

# client.sendData('dex')

# client.sendData('x')

# client.sendData('0')

# client.sendData('unequal')

# client.sendData('0')

# client.sendData('and')

# client.sendData('z')

# client.sendData('equal')

# client.sendData('w')

# client.sendData('cof')
