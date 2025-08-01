const fs = require('fs');
const Path = require('path');


// all available direct commands.
directCommands = [
    'change-directory',
    'save-file',
    'save-as',
    'reveal-cursor',
    'new-untitled',
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
    'exit-app',
    'select-line',
    'delete-left',
    'delete-right'
];

indirectCommands = [
    "open-file-from-directory",
    "expand-folder",
    "collapse-folder",
    "navgiate-to-tab",
    "set-cursor-to-line",
    "set-cursor-to-column",
    "focus-folder",
    "select-up",
    "select-down",
    "select-right",
    "select-left",
    "new-file"
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
    try {
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
    } catch(e) {

    }
}

function openFile(mainWindow, filename) {
    try {
        for (var i = 0; i < currentFiles.length; i++) {
            if (currentFiles[i] === filename) {
                filePath = Path.join(currentlyFocusedFolderPath, filename);
                mainWindow.webContents.send('request-open-filename', filePath);
                return;
            }
        }
    } catch (e) {

    }
    console.log(`File ${filename} does not exist.`);
}

function expandFolder(mainWindow, folderName) {
    try {
        folderPath = Path.join(currentlyFocusedFolderPath, folderName);
        let parentPath = rootDir.split(Path.sep);
        parentPath.pop();
        let rootFolderPath = Path.join(parentPath.join(Path.sep), folderName);
        if (rootFolderPath === currentlyFocusedFolderPath) {
            mainWindow.webContents.send('request-expand-foldername', rootFolderPath);
            return;
        } else {
            for (var i = 0; i < currentFolders.length; i++) {
                if (currentFolders[i] === folderName) {
                    mainWindow.webContents.send('request-expand-foldername', folderPath);
                    return;
                }
            }
        }
    } catch (e) {

    }

    console.log(`Folder ${folderName} does not exist.`);
}

function collapseFolder(mainWindow, folderName) {
    try {
        folderPath = Path.join(currentlyFocusedFolderPath, folderName);
        let parentPath = rootDir.split(Path.sep);
        parentPath.pop();
        let rootFolderPath = Path.join(parentPath.join(Path.sep), folderName);
        if (rootFolderPath === currentlyFocusedFolderPath) {
            mainWindow.webContents.send('request-collapse-foldername', currentlyFocusedFolderPath);
            return;
        } else {
            for (var i = 0; i < currentFolders.length; i++) {
                if (currentFolders[i] === folderName) {
                    mainWindow.webContents.send('request-collapse-foldername', folderPath);
                    return;
                }
            }
        }
    } catch(e) {

    }

    console.log(`Folder ${folderName} does not exist.`);
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
        number = parseInt(columnNumber, 10);
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

function addFileToCurrentFiles(filePath) {
    let fileDirPath = filePath.split(Path.sep);
    fileDirPath.pop();
    fileDirPath = fileDirPath.join(Path.sep);

    if (fileDirPath == currentlyFocusedFolderPath) {
        let fileName = filePath.split(Path.sep).pop();
        if (!currentFiles.includes(fileName)) {
            currentFiles.push(fileName);
        }
    }
}


function selectLeft(mainWindow, numCols) {
    if (!isNaN(numCols)) {
        mainWindow.webContents.send('request-select-left', numCols);
    }
}

function selectRight(mainWindow, numCols) {
    if (!isNaN(numCols)) {
        mainWindow.webContents.send('request-select-right', numCols);
    }
}

function selectUp(mainWindow, numRows) {
    if (!isNaN(numRows)) {
        mainWindow.webContents.send('request-select-up', numRows);
    }
}

function selectDown(mainWindow, numRows) {
    if (!isNaN(numRows)) {
        mainWindow.webContents.send('request-select-down', numRows);
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
            case 'collapse-folder': {
                collapseFolder(mainWindow, keyword);
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
            case 'select-left': {
                selectLeft(mainWindow, keyword);
                break;
            }
            case 'select-right': {
                selectRight(mainWindow, keyword);
                break;
            }
            case 'select-up': {
                selectUp(mainWindow, keyword);
                break;
            }
            case 'select-down': {
                selectDown(mainWindow, keyword);
                break;
            }
            case 'new-file': {
                try {
                    if (!currentFiles.includes(keyword)) {
                        let path = Path.join(currentlyFocusedFolderPath, keyword);
                        currentFiles.push(keyword);
                        fs.writeFileSync(path, '');
                        openFile(mainWindow, keyword);
                    }
                } catch(e) {

                }
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
        case 'save-as': {
            mainWindow.webContents.send('request-save-current-file-as');
            break;
        }
        case 'browse-file': {
            mainWindow.webContents.send('request-open-file');
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
    setRootDirectory,
    addFileToCurrentFiles
};