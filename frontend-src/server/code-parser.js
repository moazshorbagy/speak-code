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
    'grave',
    'if',
    'else-if',
    'while',
    'for',
    'for-loop'
];

// insert code directly
directCodeInsertion = function (mainWindow, keyword, codeInserter, previousLines) {
    let words = keyword.split('\\');
    let args = [];
    if(words.length != 1) {
        keyword = words[0];
        for(i = 1; i < words.length; i++) {
            args.push(words[i]);
        }
    }
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
            case 'if': {
                let codeBlock = codeInserter.if(previousLines);
                let code = codeBlock['code'];
                let cursorMoveValue = codeBlock['cursorMoveValue'];
                insertPlainCode(mainWindow, code);
                mainWindow.webContents.send('request-update-cursor', cursorMoveValue);
                break;
            }
            case 'else-if': {
                let codeBlock = codeInserter.elseIf(previousLines);
                let code = codeBlock['code'];
                let cursorMoveValue = codeBlock['cursorMoveValue'];
                insertPlainCode(mainWindow, code);
                mainWindow.webContents.send('request-update-cursor', cursorMoveValue);
                break;
            }
            case 'for': {
                let codeBlock = codeInserter.for(previousLines);
                let code = codeBlock['code'];
                let cursorMoveValue = codeBlock['cursorMoveValue'];
                insertPlainCode(mainWindow, code);
                mainWindow.webContents.send('request-update-cursor', cursorMoveValue);
                break;
            }
            case 'while': {
                let codeBlock = codeInserter.while(previousLines);
                let code = codeBlock['code'];
                let cursorMoveValue = codeBlock['cursorMoveValue'];
                insertPlainCode(mainWindow, code);
                mainWindow.webContents.send('request-update-cursor', cursorMoveValue);
                break;
            }
            case 'for-loop': {
                let codeBlock = codeInserter.forLoop(previousLines, args);
                let code = codeBlock['code'];
                let cursorMoveValue = codeBlock['cursorMoveValue'];
                insertPlainCode(mainWindow, code);
                mainWindow.webContents.send('request-update-cursor', cursorMoveValue);
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
