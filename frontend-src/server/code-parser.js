const electron = require('electron');
const fs = require('fs');

const ipcMain = electron.ipcMain;

// requests the renderer process to insert `code` into the editor
// doesn't take care of the cursor position
function insertPlainCode(mainnWindow, code) {
    mainnWindow.webContents.send('insert-plain-code', code);
}

// insert code directly
directCodeInsertion = function (mainWindow, keyword, codeInserter) {
    if (directCodeInsertionCmds.includes(keyword)) {
        switch (keyword) {
            case 'brackets': {
                insertPlainCode(mainWindow, '()');
                mainWindow.webContents.send('request-horizontal-move-cursor', -1);
                break;
            }
            case 'braces': {
                insertPlainCode(mainWindow, '{}');
                mainWindow.webContents.send('request-horizontal-move-cursor', -1);
                break;
            }
            case 'square-brackets': {
                insertPlainCode(mainWindow, '[]');
                mainWindow.webContents.send('request-horizontal-move-cursor', -1);
                break;
            }
            case 'grave': {
                insertPlainCode(mainWindow, '``');
                mainWindow.webContents.send('request-horizontal-move-cursor', -1);
                break;
            }
            case 'single-quote': {
                insertPlainCode(mainWindow, "''");
                mainWindow.webContents.send('request-horizontal-move-cursor', -1);
                break;
            }
            case 'double-quotes': {
                insertPlainCode(mainWindow, "\"\"");
                mainWindow.webContents.send('request-horizontal-move-cursor', -1);
                break;
            }
            case 'new-scope': {
                mainWindow.webContents.send('get-previous-lines');

                ipcMain.once('previous-lines', function (event, lines) {

                    mainWindow.webContents.send('request-horizontal-move-cursor', lines[lines.length - 1].length);

                    insertPlainCode(mainWindow, codeInserter.newScope(lines));
                });
                break;
            }
            case 'exit-scope': {
                mainWindow.webContents.send('get-previous-lines');

                ipcMain.once('previous-lines', function (event, lines) {

                    mainWindow.webContents.send('request-horizontal-move-cursor', lines[lines.length - 1].length);

                    insertPlainCode(mainWindow, codeInserter.exitScope(lines));
                });
                break;
            }
            case 'enter': {
                mainWindow.webContents.send('get-previous-lines');

                ipcMain.once('previous-lines', function (event, lines) {

                    mainWindow.webContents.send('request-horizontal-move-cursor', lines[lines.length - 1].length);

                    insertPlainCode(mainWindow, codeInserter.enter(lines));
                });
                break;
            }
        }
    } else {
        insertPlainCode(mainWindow, keyword);
    }
}

//this dictionary holds every model's variables and their type.
let modelsVariables = {};

// This function is programming language specific.
function getFileVariables(mainWindow) {
    mainWindow.webContents.send('request-file-path');

    ipcMain.once('file-path', function (event, args) {

        var keys = Object.keys(modelsVariables);
        if (keys.includes(args)) {
            return;
        }

        lines = fs.readFileSync(args, "utf8").split('\n');

        for (index in lines) {
            tokens = lines[index].split(' ');

            //TODO 1: skip comments and strings.
            // iComment = tokens.indexOf(commentSymbol);
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
    directCodeInsertion
}
