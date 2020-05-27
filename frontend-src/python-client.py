import zerorpc
import time

client = zerorpc.Client(heartbeat=30000, timeout=32000)
client.connect("tcp://127.0.0.1:4242")

simpleWhileLoop = [
    'swhile', 'x', 'equal', 'y', 'and', 'hamada', 'unequal', 'z', 'cof'
]

simpleFnCall = [
    'call', 'fun1', 'puff'
]

fnCallWithParams = [
    'call', 'fun2', 'x1', 'x2', 'x3', 'x4', 'puff'
]

nestedFnCall = [
    'call', 'fun3', 'call', 'fun4', 'puff', 'y1', 'y2', 'puff'
]

ifBlockWithIndexingVars = [
    'sif', 'dex', 'x', '0', 'unequal', 'dex', 'x', '1', 'cof'
]

ifBlockWithFunctionCall = [
    'sif', 'call', 'len', 'puff', 'equal', '0', 'cof'
]

ifBlockWithFunctionCallWithParam = [
    'sif', 'call', 'len', 'x', 'puff', 'equal', '0', 'cof'
]

ifBlockWithFunctionCallWithParams = [
    'sif', 'call', 'len', 'x', 'y', 'puff', 'equal', '0', 'cof'
]

whileLoopWithVarCallsMethod = [
    'swhile', 'call', 'len', 'grab', 'hamdy', 'keys', 'puff', 'puff', 'unequal', 'call', 'squre', 'x', 'puff', 'cof'
]

nestedIndexing = [
'dex', 'x0', 'dex', 'x', 'dex', 'y', 'dex', 'r2', 'call', 'len', 'r3', 'puff'
]

callFunc = [
    'call', 'findVulnerabilities', 'puff'
]

callFuncWithParams = [
    'call', 'findVulnerabilities', 'call', 'x', 'puff', 'z', 'call', '3adyAho', 'puff', 'call', 'elmafroodez', 'puff', 'puff'
]


for i in range(len(ifBlockWithIndexingVars)):
    client.sendData(ifBlockWithIndexingVars[i])
    time.sleep(1)

# for i in range(len(ifBlockWithFunctionCall)):
#     client.sendData(ifBlockWithFunctionCall[i])
#     time.sleep(1)

# for i in range(len(ifBlockWithIndexingVars)):
#     client.sendData(ifBlockWithIndexingVars[i])
#     time.sleep(1)

# for i in range(len(simpleWhileLoop)):
#     client.sendData(simpleWhileLoop[i])
#     time.sleep(1)