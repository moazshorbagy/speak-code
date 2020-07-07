const commandsParser = require('./../server/commands-parser');

const chokidar = require('chokidar');
const Path = require('path');

let watcher;

openDirectory = function (mainWindow, dialog, event, prevPath) {
    dialog.showOpenDialog(mainWindow, {
        properties: ['openDirectory']
    }).then(result => {
        if (!result.canceled) {
            var filePath = result.filePaths[0];
            if (filePath !== prevPath) {
                event.sender.send('chosen-directory', filePath);
                commandsParser.setRootDirectory(mainWindow, filePath);
                watchDirectory(mainWindow, filePath);
            } else {
                console.log('same directory');
            }
        }
    }).catch(err => {
        console.log(err)
    });
}

function watchDirectory(mainWindow, directoryPath) {
    watcher = chokidar.watch(directoryPath, {
        ignoreInitial: true,
    });

    watcher.on('add', path => {
        let directoryContent = fs.readdirSync(directoryPath);
        console.log(directoryContent);
        commandsParser.addFileToCurrentFiles(path);
        console.log(`File ${path} has been added`);
        mainWindow.webContents.send('request-add-file', path);
    });
}


module.exports = {
    openDirectory
}

