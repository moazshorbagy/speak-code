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


for i in range(len(simpleWhileLoop)):
    client.sendData(simpleWhileLoop[i])
    time.sleep(1)
