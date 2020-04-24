

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

// updated after every code insertion.
let currentCodeArea;

// updated after every code insertion.
let currentVariables = [];

let currentCommandKeyword;

let currentCodeBlockBeingConstructed = [];

cancelConstructingCodeblock = function() {
    currentCodeBlockBeingConstructed = [];
}

insertPlainCode = function(mainnWindow, code) {
    mainnWindow.webContents.send('insert-plain-code', code);
}

constructIndicrectCodeBlock = function(mainnWindow, parameter) {
    if(currentCommandKeyword == '') {
        
    }
    currentCodeBlockBeingConstructed.add(parameter)
}

createCodeInsertionBlock = function(keyword) {
    currentCodeBlockBeingConstructed.add(keyword);
}

function executeConstructedCommand(mainnWindow, ...parameters) {
    switch(currentCommandKeyword) {
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
    createCodeInsertionBlock
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
    return `if ${formCondition(conditions)}:`, `\t`,join('\n');
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
    if(parameters.length == 0) {
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