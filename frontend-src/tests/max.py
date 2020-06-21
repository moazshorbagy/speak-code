import zerorpc
import time

client = zerorpc.Client(heartbeat=30000, timeout=32000)
client.connect("tcp://127.0.0.1:4242")

getMaxfunction = [
    'deaf variable get max camel case brackets', 'array one', 'new scope',
    'variable max value snake case to be minus 1 enter',
    'for i in range', 'brackets', 'length brackets array one', 'new scope',
    'if array one of i move right at least variable max value snake case new scope',
    'variable max value snake case to be array one of i', 'exit scope', 'exit scope',
    'return variable max value snake case',
    'exit scope'
]

for i in range(len(getMaxfunction)):
    client.sendData(getMaxfunction[i])
    time.sleep(0.5)

