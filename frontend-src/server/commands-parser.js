const fs = require('fs');
const Path = require('path');


// all available direct commands.
directCommands = [
    'change-directory',
    'save-file',
    'reveal-cursor',
    'new-file',
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
    'delete-line',
    'unfocus-folder',
    'browse-file',
    'exit-app'
];

indirectCommands = [
    "open-file-from-directory",
    "expand-folder",
    "navgiate-to-tab",
    "set-cursor-to-line",
    "set-cursor-to-column",
    "focus-folder"
];

let cmd;

let rootDir;

let currentlyFocusedFolderPath;

let currentFolders;

let currentFiles;

// empties all arrays that store data about
// the focused folder and its content.
function deleteContent() {
    currentFiles = [];
    currentFolders = [];
}

setRootDirectory = function (mainWindow, directoryPath) {

    // set rootDir global var
    rootDir = directoryPath;

    currentlyFocusedFolderPath = directoryPath;

    content = fs.readdirSync(directoryPath, { withFileTypes: true });

    setCurrentFilesAndFolders(content);

    mainWindow.webContents.send('request-focus-folder', directoryPath);
}

function setCurrentFilesAndFolders(content) {

    deleteContent();

    for (i = 0; i < content.length; i++) {

        if (content[i].isDirectory()) {

            currentFolders.push(content[i].name);

        } else if (content[i].isFile()) {

            currentFiles.push(content[i].name);
        }
    }
}

function checkDirectCommand(command) {
    if (!directCommands.includes(command)) {
        return false;
    }
    return true;
}

function focusFolder(mainWindow, folderName) {
    // this means that the folder request to be focused
    // does not exist in the currently focused folder.
    for (var i = 0; i < currentFolders.length; i++) {

        if (currentFolders[i] === folderName) {

            mainWindow.webContents.send('request-unfocus-folder', currentlyFocusedFolderPath);

            // set currentlyFocusedFolderPath
            currentlyFocusedFolderPath = Path.join(currentlyFocusedFolderPath, folderName);

            // set current files and current folders
            content = fs.readdirSync(currentlyFocusedFolderPath, { withFileTypes: true });

            setCurrentFilesAndFolders(content);

            mainWindow.webContents.send('request-focus-folder', currentlyFocusedFolderPath);

            break;
        }
    }
}

function openFile(mainWindow, filename) {
    for (var i = 0; i < currentFiles.length; i++) {
        if (currentFiles[i] === filename) {
            filePath = Path.join(currentlyFocusedFolderPath, filename);
            mainWindow.webContents.send('request-open-filename', filePath);
            break;
        }
    }
}

function expandFolder(mainWindow, folderName) {
    for (var i = 0; i < currentFolders.length; i++) {
        if (currentFolders[i] === folderName) {
            folderPath = Path.join(currentlyFocusedFolderPath, folderName);
            mainWindow.webContents.send('request-expand-foldername', folderPath);
            break;
        }
    }
}

function gotoTab(mainWindow, tabNumber) {
    if (!isNaN(tabNumber)) {
        number = parseInt(tabNumber, 10);
        mainWindow.webContents.send('request-tab-number', number);
    }
}

function gotoLine(mainWindow, lineNumber) {
    if (!isNaN(lineNumber)) {
        number = parseInt(lineNumber, 10);
        mainWindow.webContents.send('request-line-number', number);
    }
}

function gotoColumn(mainWindow, columnNumber) {
    if (!isNaN(columnNumber)) {
        number = parseInt(lineNumber, 10);
        mainWindow.webContents.send('request-column-number', number);
    }
}

function unfocusFolder(mainWindow) {

    if (currentlyFocusedFolderPath !== rootDir) {

        mainWindow.webContents.send('request-unfocus-folder', currentlyFocusedFolderPath);

        // move in the directory path one element back
        pathArray = currentlyFocusedFolderPath.split(Path.sep);
        currentFolder = pathArray.pop();
        currentlyFocusedFolderPath = pathArray.join(Path.sep);

        content = fs.readdirSync(currentlyFocusedFolderPath, { withFileTypes: true });

        setCurrentFilesAndFolders(content);

        mainWindow.webContents.send('request-focus-folder', currentlyFocusedFolderPath);
    }
}

constructIndicrectCommand = function (mainWindow, keyword, isParameter) {
    if (isParameter) {
        switch (cmd) {
            case 'open-file-from-directory': {
                openFile(mainWindow, keyword);
                break;
            }
            case 'focus-folder': {
                focusFolder(mainWindow, keyword);
                break;
            }
            case 'expand-folder': {
                expandFolder(mainWindow, keyword);
                break;
            }
            case 'set-cursor-to-column': {
                gotoColumn(mainWindow, keyword);
                break;
            }
            case 'set-cursor-to-line': {
                gotoLine(mainWindow, keyword);
                break;
            }
            case 'navgiate-to-tab': {
                gotoTab(mainWindow, keyword);
                break;
            }
        }
        return true;
    } else {
        if (indirectCommands.includes(keyword)) {
            cmd = keyword;
        }
    }
}

exitApp = function(mainWindow) {

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
        case 'unfocus-folder': {
            unfocusFolder(mainWindow);
            break;
        }
        case 'browse-file': {
            mainWindow.webContents.send('request-open-file');
            break;
        }
        case 'exit-app': {

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
    constructIndicrectCommand,
    setRootDirectory
};