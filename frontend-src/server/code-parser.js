
let currentParameteredCommand = {};

let avaialbleCodeBlocksParameterNumbers = {
    'for-loop-block': '2', // indexer name + nuimber passed to range.
    'foreach-block': '2', // iterator name + iteraetable.
    'define-function': '1+', // function name + parameters.
    'call-function': '1+', // function name + parameters.
    'variable-calls-method': '2+', // variable name + method name + parameters.
    'while-loop-block': '1+', // condition formation.
    'condition-formation': '4+', // var1 + condition + var2 + ..... + 'cof'
    'index-a-variable': '2', // variable name + index,
    'if-block': '1+' // condition formation
};

// updated after every code insertion.
let currentCodeArea;

// updated after every code insertion.
let currentVariables = [];

let currentCodeBlockBeingConstructed = [];

cancelConstructingCodeblock = function() {
    currentCodeBlockBeingConstructed = [];
}

insertPlainCode = function(mainnWindow, word) {
    mainnWindow.webContents.send('insert-plain-code', word);
}

createCodeInsertionBlock = function(keyword) {
    currentCodeBlockBeingConstructed.addd(keyword);
}

function executeConstructedCommand() {

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