import zerorpc
import time

client = zerorpc.Client(heartbeat=30000, timeout=32000)
client.connect("tcp://127.0.0.1:4242")

initvariable = [
    'variable my first var camel case to be', 'of', 'x', 'i', 'plus', 'one', 'finish', 'plus'
]

indexVariableOnCondition = [
    'of', 'x', 'call', 'length', 'x', 'finish', 'minus', 'one', 'finish', 'enter' 
]

newLine = [
    'variable new var snake case to be variable my first var camel case'
]

for i in range(len(initvariable)):
    client.sendData(initvariable[i])
    time.sleep(1)

for i in range(len(indexVariableOnCondition)):
    client.sendData(indexVariableOnCondition[i])
    time.sleep(1)

for i in range(len(newLine)):
    client.sendData(newLine[i])
    time.sleep(1)