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
    'paste',
    'backspace',
    'comment-line',
    'delete-line'
];

currentConstructedCommand = [];

function checkDirectCommand(command) {
    if (!directCommands.includes(command)) {
        return false;
    }
    return true;
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
        case 'increment-cursor': {
            mainWindow.webContents.send('request-horizontal-move-cursor', 1);
            break;
        }
        case 'decrement-cursor': {
            mainWindow.webContents.send('request-horizontal-move-cursor', -1);
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