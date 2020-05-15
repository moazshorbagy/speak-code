import zerorpc
import time

client = zerorpc.Client(heartbeat=30000, timeout=32000)
client.connect("tcp://127.0.0.1:4242")

simpleWhileLoop = [
    'swhile', 'x', 'equal', 'y', 'and', 'hamada', 'unequal', 'z', 'cof'
]

ifBlockWithIndexingVars = [
    'sif', 'dex', 'x', '0', 'unequal', 'dex', 'x', '1', 'cof'
]

ifBlockWithFunctionCall = [
    'sif', 'call', 'len', 'x', 'puff', 'equal', '0', 'cof'
]

whileLoopWithVarCallsMethod = [
    'swhile', 'call', 'len', 'grab', 'hamdy', 'keys', 'puff', 'puff', 'unequal', 'zero', 'cof'
]

nestedIndexing = [
    'dex', 'x', 'dex', 'y', 'dex', 'z', 'dex', 'r2', '0'
]


for i in range(len(nestedIndexing)):
    client.sendData(nestedIndexing[i])
    time.sleep(1)

for i in range(len(whileLoopWithVarCallsMethod)):
    client.sendData(whileLoopWithVarCallsMethod[i])
    time.sleep(1)

for i in range(len(ifBlockWithFunctionCall)):
    client.sendData(ifBlockWithFunctionCall[i])
    time.sleep(1)

for i in range(len(ifBlockWithIndexingVars)):
    client.sendData(ifBlockWithIndexingVars[i])
    time.sleep(1)

for i in range(len(simpleWhileLoop)):
    client.sendData(simpleWhileLoop[i])
    time.sleep(1)