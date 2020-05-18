const electron = require('electron');

const ipcMain = electron.ipcMain;


/// These commands and grammar are specific to python
/// Generalization can be made by adding available commands and their types, number
/// of parameters, and cursor update values, for different programming languages

/// More generalization can be made by exploiting the common code-blocks 
/// across programming languages such as c++, java, python


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
    'initialize-variable',
    'define-class',
    'parameters-insertion'
];

// TODO 1: updated after every code insertion.
let currentVariables = [];

// cancel any code block being constructed that haven't been terminated yet
cancelConstructingCodeblock = function () {

    // TODO 1.1: handle any misplacement of cursor in the code

    cmdStack = [];
    cmdStage = [];
    transformedCmdsStack = [];
}

// idicates that the current command being executed 
// may have infinite parameters.
let transformCmds = {
    'call-function': 'parameters',
    'define-function': 'parameters',
    'variable-calls-method': 'parameters',
    'if-block': 'conditions',
    'while-loop-block': 'conditions'
}

// moving the cursor horizontally
// taking care of inserting the root
// last array element indicates moving the cursor 
// out of the command
let cursorMovingValues = {
    'index-variable': [-2, 1, 1],
    'variable-calls-method': [-3, 1, 1, 1],
    'call-function': [-2, 1],
    'if-block': [-1],
    'while-loop-block': [-1],
    'for-loop-block': [-12, 10],
    'foreach-block': [-5, 4],
    'define-function': [-3, 1]
}

// the basic strings to be inserted if any of the available commands are spoken
let commandRoots = {
    'index-variable': '[]',
    'variable-calls-method': '.()',
    'call-function': '()',
    'if-block': 'if :',
    'while-loop-block': 'while :',
    'for-loop-block': 'for  in range():',
    'foreach-block': 'for  in :',
    'define-function': 'def ():'
}

// is one of the `available` commands.
let cmdStack = [];

// current stage effectively determines the index
// at which we are in the `cursorMovingValues`.
let cmdStage = [];

// code blocks that must be in a separate line
let needsIndependentLine = [
    'if-block',
    'while-loop-block',
    'define-function',
    'for-loop-block',
    'foreach-block'
]

// for indefinite number of variables,
// spacing between them after every variable insertion is defined below.
let variablesSpacing = {
    'conditions': ' ',
    'parameters': ', '
}

// infinite parameters commands
let infiniteParamsCmd = [
    'conditions',
    'parameters'
]

// the keywords that terminates indefinite parameters commands
let infParamsTermination = {
    'conditions': 'cof',
    'parameters': 'puff',
}

// minimum number of parameters that should be passed to any of the available command
let basicNumParams = {
    'index-variable': 2,
    'variable-calls-method': 3,
    'call-function': 2,
    'if-block': 0,
    'while-loop-block': 0,
    'for-loop-block': 2,
    'foreach-block': 2,
    'define-function': 2
}

// keep track of transformed indefinite number of parameters commands
// they are either transformed to `conditions` or `parameters`
let transformedCmdsStack = [];

// returns false if commmand is not completed yet
// return true if command is successfully executed.
constructIndicrectCodeBlock = function (mainWindow, parameter) {
    mainWindow.webContents.send('get-current-line');

    ipcMain.once('current-line', function (event, line) {
        scope = getScope(line);

        // check if the parameter is a keyword
        if (availableCommands.includes(parameter)) {

            // go to next new line
            if (needsIndependentLine.includes(parameter) && line != '') {
                insertPlainCode(mainWindow, '\n');
            }


            if (cmdStack.length != 0) {

                var keys = Object.keys(transformCmds)
                cmd = cmdStack[cmdStack.length - 1]
                if (keys.includes(cmd)) {
                    transformedCmdsStack.push(cmdStack.pop())
                    cmdStack.push(transformCmds[cmd])
                    cmd = cmdStack[cmdStack.length - 1]
                }

                if (infiniteParamsCmd.includes(cmdStack[cmdStack.length - 1]) && cmdStage[cmdStage.length - 1] - 1 > basicNumParams[transformedCmdsStack[transformedCmdsStack.length - 1]]) {
                    insertPlainCode(mainWindow, variablesSpacing[cmdStack[cmdStack.length - 1]]);
                }
            }

            // push the command to the cmdStack
            cmdStack.push(parameter);

            // stage determines the index of the cursor movement
            // according to cursorMovingValues (initially = 0)
            cmdStage.push(0);

            // TODO 2: handle scope level

            // insert the root of the codeblock
            insertPlainCode(mainWindow, commandRoots[parameter]);

            // move the cursor according to stage and cursorMovingValues
            updateCursor(mainWindow)

            // update cmd stage
            cmdStage[cmdStage.length - 1] += 1

        } else {
            // update cmd variable (keeps track of the most recent command)
            cmd = cmdStack[cmdStack.length - 1]

            if (paramResolvesInfVarsCmd(parameter)) {

                // TODO 3: handle end of indefinite command cursor update
                mainWindow.webContents.send('increment-cursor', 1)

                // pop the command from the command stack as well as its stage
                cmdStack.pop();
                cmdStage.pop();
                transformedCmdsStack.pop();

                // check if cursor needs update then update it
                if (cmdStack.length != 0) {
                    cmd = cmdStack[cmdStack.length - 1]
                    if (!infiniteParamsCmd.includes(cmd)) {
                        updateCursor(mainWindow, cmd)
                    }
                    resolveCmd(cmd, mainWindow);
                }

                //TODO 4: handle scope and indentation if the code block needs a new line
                return;
            }

            // check if the current command may have infinite parameters then apply variable spacing.
            if (infiniteParamsCmd.includes(cmd)) {
                console.log(cmd)
                console.log(cmdStage)
                if (cmdStage[cmdStage.length - 1] > basicNumParams[transformedCmdsStack[transformedCmdsStack.length - 1]]) {
                    insertPlainCode(mainWindow, variablesSpacing[cmd] + parameter)
                } else {
                    insertPlainCode(mainWindow, parameter);
                }
            } else {

                insertPlainCode(mainWindow, parameter)
                updateCursor(mainWindow)

                // resolves command that have determinant number of parameters
                resolveCmd(cmd, mainWindow);

            }
            cmdStage[cmdStage.length - 1] += 1
        }
    });
}

// returns true if the word said ends the parameters
// that are passed to a command with indefinite number of parameters
function paramResolvesInfVarsCmd(param) {
    if (cmdStack.length == 0) {
        return false;
    }

    cmd = cmdStack[cmdStack.length - 1];
    if (infParamsTermination[cmd] == param) {
        return true;
    } else {
        return false;
    }
}

// resolve finite number of parameters commands
function resolveCmd(cmd, mainWindow) {
    // checks whether the command has been successfully passed all the parameters
    // removes it from command stack and updates the cursor
    while (!infiniteParamsCmd.includes(cmd) && cursorMovingValues[cmd].length == cmdStage[cmdStage.length - 1] + basicNumParams[cmd] - 1) {
        // check if the command may have indefinite parameters
        var keys = Object.keys(transformCmds)
        if (keys.includes(cmd)) {
            transformedCmdsStack.push(cmdStack.pop())
            cmdStack.push(transformCmds[cmd])
            cmd = cmdStack[cmdStack.length - 1]
        } else {
            cmdStage.pop();
            cmdStack.pop();
            cmd = cmdStack[cmdStack.length - 1]
            if (!cmd || infiniteParamsCmd.includes(cmd)) {
                break;
            }
            // else update the cursor normally
            updateCursor(mainWindow)
        }
    }
}

// assuming that the indentation is 4 spaces
function getScope(currentLine) {
    k = 0;
    for (let i = 0; i < currentLine.length; i++) {
        if (currentLine[i] == ' ') {
            k += 1;
        } else {
            break;
        }
    }
    return k / 4;
}

// requests the renderer process to insert `code` into the editor
// doesn't take care of the cursor position
function insertPlainCode(mainnWindow, code) {
    mainnWindow.webContents.send('insert-plain-code', code);
}

// updates the cursor according to the last command in the command stack
function updateCursor(mainWindow) {
    var currentCmd = cmdStack[cmdStack.length - 1]
    var cursorIncrementValues = cursorMovingValues[currentCmd]
    var val = cursorIncrementValues[cmdStage[cmdStage.length - 1]]
    mainWindow.webContents.send('increment-cursor', val);
}


module.exports = {
    cancelConstructingCodeblock,
    constructIndicrectCodeBlock
}
