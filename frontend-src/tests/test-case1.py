import zerorpc
import time

client = zerorpc.Client(heartbeat=30000, timeout=32000)
client.connect("tcp://127.0.0.1:4242")

initvariable = [
    'variable my first var camel case to be', 'x', 'of', 'i', 'plus', 'one', 'plus'
     'x', 'of', 'length', 'brackets', 'x', 'move right', 'minus', 'one', 'enter',
    'variable new var snake case to be variable my first var camel case',
]

def testUsingTestVector(testVector, timestep):
    for i in range(len(testVector)):
        client.sendData(testVector[i])
        time.sleep(timestep)

client.sendData('paste')