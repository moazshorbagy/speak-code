// all available commands (keywords).
availableCommands = [
    'change-directory',
    'new-file',
    'open-file-from-directory',
    'close-tab',
    'close-all-tabs',
    'save-file',
    'navgiate-to-tab',
    'save-file-as',
    'add-file-to-target-directory',
    'add-folder-to-target-directory',
    'scroll-to-line',
    'reveal-cursor',
    'goto-scope',
    'scroll-to-column',
    'set-cursor',
    'increment-cursor',
    'decrement-cursor'
];

currentConstructedCommand = [];

function checkCommand(command) {
    if (!availableCommands.includes(command)) {
        return false;
    }
    return true;
}

cancelConstructingCommand = function() {
    currentConstructedCommand = [];
}

constructIndicrectCommand = function(mainWindow, keyword) {
    currentConstructedCommand.push(keyword);
}

// returns false if the command doesn't exist
executeCommand = function (mainWindow, command) {
    if (!checkCommand(command)) {
        return false;
    }
    switch (command) {
        case 'change-directory': {
            mainWindow.webContents.send('request-open-folder');
            break;
        }
        case 'save-file': {
            mainWindow.webContents.send('save-file');
            break;
        }
        case 'new-file': {
            mainWindow.webContents.send('request-open-file');
            break;
        }
        case 'increment-cursor': {
            mainWindow.webContents.send('increment-cursor', 1);
            break;
        }
        case 'decrement-cursor': {
            mainWindow.webContents.send('increment-cursor', -1);
            break;
        }
    }
}


module.exports = {
    executeCommand,
    constructIndicrectCommand
};