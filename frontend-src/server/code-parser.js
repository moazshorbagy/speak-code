const electron = require('electron');

const ipcMain = electron.ipcMain;

let avaialbleCodeBlocksParameterNumbers = {
    'for-loop-block': '2', // indexer name + number passed to range.
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
    'end-of-command',
    'initialize-variable'
];

let currentState = {
    'currentScope': 0,
    'currentCodeBlock': ''
};

let avaiableStates = [
    'indexing',
    'calling-a-function',
    'forming-condition',
    'forming-while-loop',
    'forming-for-loop',
    'forming-foreach-loop',
]

// updated after every code insertion.
let currentVariables = [];

let currentCommandStack = [];


cancelConstructingCodeblock = function () {
    currentCommandStack = [];
}

insertPlainCode = function (mainnWindow, code) {
    mainnWindow.webContents.send('insert-plain-code', code);
}


// returns false if commmand is not completed yet
// return true if command is successfully executed.
constructIndicrectCodeBlock = function (mainWindow, parameter) {
    mainWindow.webContents.send('get-current-line');

    ipcMain.once('current-line', function(event, line) {
        scope = getScope(line);
    });
    // keyword that means end of command.
    if (parameter == 'cof') {
        codeBlockArray = [];
        // parsing process
        while (currentCommandStack.length != 0) {
            parameters = [];

            // pop parameters until 
            while (!(availableCommands.includes(currentCommandStack[currentCommandStack.length - 1]))) {
                parameters.unshift(currentCommandStack.pop());
            }
            command = currentCommandStack.pop();
            codeBlockArray.push(formCodeArray(command, parameters));
        }
        command = codeBlockArray.pop();
        code = formCodeInsertion(command, codeBlockArray);

        module.exports.insertPlainCode(mainWindow, code);
        return true;
    } else {
        currentCommandStack.push(parameter);
        return false;
    }
}

// assuming that the indentation is 4 spaces
function getScope(currentLine) {
    k = 0;
   for(let i = 0; i < currentLine.length; i++) {
      if(currentLine[i] == ' ') {
          k += 1;
      }  else {
          break;
      }
   } 
   return k / 4;
}

function formCodeArray(command, params) {
    switch (command) {
        case 'condition-formation': {
            return params.join(' ');
        }
        case 'if-block': {
            return 'if';
        }
        case 'while-loop-block': {
            return 'while';
        }
        case 'for-loop-block': {
            return params.join(' ');
        }
        case 'foreach-block': {
            return 'foreach';
        }
        case 'index-variable': {
            return [params[0], '[', params[1], ']'].join('');
        }
        case 'define-function': {
            return 'defunc';
        }
        case 'call-function': {
           functionName = params.shift();
           return [functionName, '(', params.join(', '), ')'],join('');
        }
        case 'variable-calls-method': {
            return params.join('.');
        }
    }
}

function formCodeInsertion(command, codeBlockArray) {
    switch(command) {
        case 'if': {
            code = codeBlockArray.join(' ');
            code = 'if ' + code;
            code += [':', '\t'].join('\n');
            return code;
        }
        case 'while': {
           code = codeBlockArray.join(' ');
           code = 'while ' + code;
           code += [':', '\t'].join('\n');  
           return code;
        }
    }
}


module.exports = {
    cancelConstructingCodeblock,
    insertPlainCode,
    constructIndicrectCodeBlock
}
