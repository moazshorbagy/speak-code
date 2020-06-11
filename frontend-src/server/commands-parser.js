// all available commands (keywords).
directCommands = [
    'change-directory',
    'save-file',
    'close-all-tabs',
    'new-file',
    'reveal-cursor',
    'zoom-in',
    'zoom-out',
    'undo',
    'redo',
    'close-tab',
    'next-tab',
    'increment-cursor',
    'decrement-cursor',
    'select-all-text',
    'cut',
    'copy',
    'paste'
];

currentConstructedCommand = [];

function checkDirectCommand(command) {
    if (!directCommands.includes(command)) {
        return false;
    }
    return true;
}

cancelConstructingCommand = function () {
    currentConstructedCommand = [];
}

constructIndicrectCommand = function (mainWindow, keyword) {
    currentConstructedCommand.push(keyword);
}

// returns false if the command doesn't exist
executeCommand = function (mainWindow, command) {
    if (!checkDirectCommand(command)) {
        return false;
    }
    switch (command) {
        case 'change-directory': {
            mainWindow.webContents.send('request-open-folder');
            break;
        }
        case 'save-file': {
            mainWindow.webContents.send('request-save-file');
            break;
        }
        case 'close-all-tabs': {
            mainWindow.webContents.send('request-close-all-tabs');
            break;
        }
        case 'new-file': {
            mainWindow.webContents.send('request-new-file');
            break;
        }
        case 'reveal-cursor': {
            mainWindow.webContents.send('request-reveal-cursor');
            break;
        }
        case 'zoom-in': {
            mainWindow.webContents.send('request-zoom-in');
            break;
        }
        case 'zoom-out': {
            mainWindow.webContents.send('request-zoom-out');
            break;
        }
        case 'undo': {
            mainWindow.webContents.send('request-undo');
            break;
        }
        case 'redo': {
            mainWindow.webContents.send('request-redo');
            break;
        }
        case 'close-tab': {
            mainWindow.webContents.send('request-close-tab');
            break;
        }
        case 'next-tab': {
            mainWindow.webContents.send('request-next-tab');
            break;
        }
        case 'increment-cursor': {
            mainWindow.webContents.send('request-horizontal-move-cursor', 1);
            break;
        }
        case 'decrement-cursor': {
            mainWindow.webContents.send('request-horizontal-move-cursor', -1);
            break;
        }
        case 'select-all-text': {
            mainWindow.webContents.send('request-select-all-text');
            break;
        }
        case 'cut': {
            mainWindow.webContents.send('request-cut');
            break;
        }
        case 'copy': {
            mainWindow.webContents.send('request-copy');
            break;
        }
        case 'paste': {
            mainWindow.webContents.send('request-paste');
            break;
        }
        default: {
            mainWindow.webContents.send('request-' + command);
            break;
        }
    }
}


module.exports = {
    executeCommand,
    constructIndicrectCommand
};