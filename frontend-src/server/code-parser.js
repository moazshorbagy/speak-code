const electron = require('electron');
const fs = require('fs');

const ipcMain = electron.ipcMain;

// requests the renderer process to insert `code` into the editor
// doesn't take care of the cursor position
function insertPlainCode(mainnWindow, code) {
    mainnWindow.webContents.send('insert-plain-code', code);
}

let directCodeInsertionCmds = [
    'brackets',
    'braces',
    'square-brackets',
    'single-quote',
    'double-quote',
    'enter',
    'new-scope',
    'exit-scope',
    'enter',
    'grave'
];

// insert code directly
directCodeInsertion = function (mainWindow, keyword, codeInserter, previousLines) {
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
                mainWindow.webContents.send('request-horizontal-move-cursor', previousLines[previousLines.length - 1].length);
                insertPlainCode(mainWindow, codeInserter.newScope(previousLines));
                break;
            }
            case 'exit-scope': {
                mainWindow.webContents.send('request-horizontal-move-cursor', previousLines[previousLines.length - 1].length);
                insertPlainCode(mainWindow, codeInserter.exitScope(previousLines));
                break;
            }
            case 'enter': {
                mainWindow.webContents.send('request-horizontal-move-cursor', previousLines[previousLines.length - 1].length);
                insertPlainCode(mainWindow, codeInserter.enter(previousLines));
                break;
            }
        }
    } else {
        insertPlainCode(mainWindow, keyword);
    }
}

module.exports = {
    directCodeInsertion
}
