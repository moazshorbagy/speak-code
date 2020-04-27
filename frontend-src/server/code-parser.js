

let avaialbleCodeBlocksParameterNumbers = {
    'for-loop-block': '2', // indexer name + nuimber passed to range.
    'foreach-block': '2', // iterator name + iteraetable.
    'define-function': '1+', // function name + parameters.
    'call-function': '1+', // function name + parameters.
    'variable-calls-method': '2+', // variable name + method name + parameters.
    'while-loop-block': '1+', // condition formation.
    'condition-formation': '4+', // var1 + condition + var2 + ..... + 'cof'
    'index-variable': '2', // variable name + index,
    'if-block': '1+' // condition formation
};

let availableCommands = [
    'for-loop-block',
    'foreach-block',
    'define-function',
    'call-function',
    'variable-calls-method',
    'while-loop-block',
    'condition-formation',
    'index-variable',
    'if-block',
    'end-of-command'
];

// updated after every code insertion.
let currentCodeArea;

// updated after every code insertion.
let currentVariables = [];

let currentCommandStack = [];

cancelConstructingCodeblock = function () {
    currentCommandStack = [];
}

insertPlainCode = function (mainnWindow, code) {
    mainnWindow.webContents.send('insert-plain-code', code);
}

constructIndicrectCodeBlock = function (mainWindow, parameter) {
    currentCommandStack.push(parameter);
    if (parameter == 'cof') {
        // pop the word 'cof'
        endofCommand = currentCommandStack.pop();
        codeBlockArray = [];
        while (currentCommandStack.length != 0) {
            parameters = [];
            while (!(availableCommands.includes(currentCommandStack[currentCommandStack.length - 1]))) {
                parameters.push(currentCommandStack.pop());
            }
            command = currentCommandStack.pop();
            param = '';
            switch (command) {
                case 'condition-formation': {
                    param = parameters.join(' ');
                    codeBlockArray.push(param);
                    break;
                }
                case 'if-block': {
                    codeBlockArray.push('if');
                }
            }
        }
        command = codeBlockArray.pop();
        code = '';
        switch(command) {
            case 'if': {
                code = codeBlockArray.join(' ');
                code = 'if ' + code;
                code += [':', '\t'].join('\n');
                break;
            }
        }
        module.exports.insertPlainCode(mainWindow, code);
        return true;
    }
    return false;
}

function executeConstructedCommand(mainnWindow, ...parameters) {
    switch (currentCommandKeyword) {
        case 'for-loop-block': {
            insertPlainCode(mainnWindow, forLoopBlock(parameters[0], parameters[1]));
            break;
        }
        case 'while-loop-block': {
            insertPlainCode(mainnWindow, whileLoopBlock(parameters));
            break;
        }
        case 'foreach-block': {
            insertPlainCode(mainnWindow, foreachBlock(parameters[0], parameters[1]));
            break;
        }
        case 'define-function': {
            insertPlainCode(mainnWindow, defineFunction(parameters[0], parameters[1]));
            break;
        }
        case 'if-block': {
            insertPlainCode(mainnWindow, ifBlock(parameters));
            break;
        }
        case 'variable-calls-method': {
            insertPlainCode(mainnWindow, variableCallsMethod(parameters[0], parameters[1], parameters[2]));
            break;
        }
        case 'index-variable': {
            insertPlainCode(mainnWindow, indexVariable(parameters[0], parameters[1]));
            break;
        }
        case 'call-function': {
            insertPlainCode(mainnWindow, callFunction(parameters[0], parameters[1]));
            break;
        }
        default: {
            break;
        }
    }
}


module.exports = {
    cancelConstructingCodeblock,
    insertPlainCode,
    constructIndicrectCodeBlock
}

function forLoopBlock(indexerName, range) {
    return `for ${indexerName} in range(${range}):`, `\t`.join('\n');
}

function foreachBlock(iteratorName, iteraetable) {
    return `for ${iteratorName} in ${iteraetable}:`, `\t`.join('\n');
}

function whileLoopBlock(...conditions) {
    return `while ${formCondition(conditions)}:`, `\t`.join('\n');
}

function ifBlock(...conditions) {
    return `if ${formCondition(conditions)}:`, `\t`, join('\n');
}

function formCondition(...conditions) {
    var condition = '(';
    for (item in conditions) {
        condition += `${item} `;
    }
    condition = condition[condition.length - 2];
    condition += ')';
    return condition;
}

function insertParameters(...parameters) {
    if (parameters.length == 0) {
        return '';
    }
    var params = '';
    for (item in parameters) {
        params += `${item}, `;
    }
    // remove last space and ','
    return params[params.length - 3];
}

function variableCallsMethod(variableName, methodName, ...parameters) {
    return `${variableName}.${methodName}(${insertParameters(parameters)}) `;
}

function callFunction(methodName, ...parameters) {
    return `${methodName}(${insertParameters(parameters)}) `;
}

function defineFunction(functionName, ...parameters) {
    return `def ${functionName}(${insertParameters(parameters)}):`, '\t'.join('\n');
}

function indexVariable(variableName, index) {
    return `${variableName}[${index}] `;
}