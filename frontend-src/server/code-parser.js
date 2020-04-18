
plainCodeCommands = [
    'for-loop',
    'while-loop',
    'declare-variable',
    'initialize-variable',
    'if-block',
    'try-catch-block',
    'undo',
    'redo'
];

forLoopBlock = function(iteratorName, range) {
    return `for ${iteratorName} in range(${range}):`, `\t`.join('\n');
}