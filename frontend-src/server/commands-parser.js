// commands that take effect in the editor container area.
commandListEditorContainer = [
    'scroll-to-line',
    'reveal-cursor',
    'goto-scope',
    'scroll-to-column',
    'set-cursor',
];

// commands that take effect in the left panel.
commandListLeftPanel = [
    'change-directory',
    'new-file',
    'open-file-from-directory',
    'open-file',
    'close-tab',
    'close-all-tabs',
    'save-file',
    'navgiate-to-tab',
    'save-file-as',
    'add-file-to-target-directory',
    'add-folder-to-target-directory'
];

// all available commands (keywords).
availableCommands = [
    'change-directory',
    'new-file',
    'open-file-from-directory',
    'open-file',
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
]

function checkCommand(command) {
    if (!availableCommands.includes(command)) {
        return false;
    }
    return true;
}

// returns false if the command doesn't exist
parseCommand = function (mainWindow, command) {
    if (!checkCommand(command)) {
        return false;
    }
    switch (command) {
        case 'change-directory': {
            mainWindow.webContents.send('request-open-folder');
            break;
        }
    }
}


module.exports = {
    parseCommand
};