const electron = require('electron');
const fs = require('fs')

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

// cancel any code block being constructed that haven't been terminated yet
cancelConstructingCodeblock = function () {

    // TODO 1.1: handle any misplacement of cursor in the code

    cmdStack = [];
    cmdStage = [];
}

endCommandString = 'finish';

// moving the cursor horizontally
// taking care of inserting the root
// last array element indicates moving the cursor 
// out of the command
let cursorMovingValues = {
    'index-variable': [-2, 1],
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

// minimum number of parameters that should be passed to any of the available command
let basicNumParams = {
    'index-variable': 2,
    'call-function': 2,
    'if-block': 1,
    'while-loop-block': 1,
    'for-loop-block': 1,
    'foreach-block': 2,
    'define-function': 1
}

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
                cmd = cmdStack[cmdStack.length - 1];
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

        } else {
            // update cmd variable (keeps track of the most recent command)
            cmd = cmdStack[cmdStack.length - 1]

            if (paramResolvesInfVarsCmd(parameter)) {
                resolveCmd(cmd, mainWindow, parameter);
            } else {
                if (cmdStage[cmdStage.length - 1] > basicNumParams[cmd]) {
                    insertPlainCode(mainWindow, parameter)
                } else {
                    insertPlainCode(mainWindow, parameter)
                    updateCursor(mainWindow)

                    // resolves command
                    resolveCmd(cmd, mainWindow);
                }
            }
        }

        // update cmd stage
        if (cmdStage.length != 0) {
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
    if (param === endCommandString) {
        return true;
    } else {
        return false;
    }
}

// resolve commands ending whether manual or automatically
function resolveCmd(cmd, mainWindow, parameter) {

    if (paramResolvesInfVarsCmd(parameter)) {

        // TODO 3: handle end of indefinite command cursor update
        mainWindow.webContents.send('increment-cursor', 1)

        // pop the command from the command stack as well as its stage
        cmdStack.pop();
        cmdStage.pop();

        cmd = cmdStack[cmdStack.length - 1];
        if (cmdStack.length == 0) {
            return;
        }

        updateCursor(mainWindow);
    }
}

// assuming that the indentation is 4 spaces (programming language specific).
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

// insert code directly
insertDirectCode = function (mainWindow, code) {
    insertPlainCode(mainWindow, code);
}

// updates the cursor according to the last command in the command stack
function updateCursor(mainWindow) {
    var currentCmd = cmdStack[cmdStack.length - 1]
    if (currentCmd) {
        var cursorIncrementValues = cursorMovingValues[currentCmd]
        if (cursorMovingValues) {
            var val = cursorIncrementValues[cmdStage[cmdStage.length - 1]]
            if (val) {
                mainWindow.webContents.send('increment-cursor', val);
            }
        }
    }
}

var commentSymbol = '#';

//this dictionary holds every model's variables and their type.
let modelsVariables = {};

// This function is programming language specific.
function getFileVariables(mainWindow) {
    mainWindow.webContents.send('get-file-content');

    ipcMain.once('file-content', function (event, args) {

        var keys = Object.keys(modelsVariables);
        if (keys.includes(args)) {
            return;
        }

        lines = fs.readFileSync(args, "utf8").split('\n');

        for (index in lines) {
            tokens = lines[index].split(' ');

            //TODO 1: skip comments and strings.
            iComment = tokens.indexOf(commentSymbol);
            iString = tokens.findIndex(element => element.includes("'"));

            // if there is a string inside a comment or a comment symbol inside a string
            if (!(iComment == -1 || iString == -1)) {

                // starting from 0 till range is the area that might have variables
                // in case of comments
                isComment = iComment > iString ? false : true;
                range = iComment > iString ? iString : iComment;

                // then we will use range to determine the are to detect variables.
                if (isComment) {
                    for (i = 0; i < range; i++) {

                    }
                }
            }

            //TODO 2: get imports. 
            if (tokens.includes('import')) {
                if (tokens.includes('as')) {

                }
            }

            //TODO 3: variables that are assigned in an assignment statement.

            //TODO 4: Member functions of imports

            //TODO 5: get class names, their members and methods names.

            //TODO 6: get functions names that are defined in a regular way (e.g. `def funName():` in python).

            //TODO 7: 

            if (!tokens.includes('=')) {
                continue;
            }

            for (i = 0; i < tokens.length; i++) {
                if (tokens[i] == '=' && i > 0) {
                    varName = tokens[i - 1];
                    if (varName == 'client') {
                        console.log(tokens[i + 1]);
                    }
                    // console.log(tokens[i + 1]);
                    break;
                }
            }
        }
    });
}

module.exports = {
    cancelConstructingCodeblock,
    constructIndicrectCodeBlock,
    insertDirectCode
}
