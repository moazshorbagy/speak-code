const { dialog } = require('electron').remote
const remote = require("electron").remote;


mainWindow = remote.BrowserWindow.getFocusedWindow();

openDialog = function(prevPath) {
    dialog.showOpenDialog(mainWindow, {
        properties: ['openDirectory']
    }).then(result => {
        if(!result.canceled) {
            populateFolderPanel(result.filePaths[0])
        }
    }).catch(err => {
        console.log(err)
    });
}

function populateFolderPanel(path) {
    const wd = require('./working-directory')
    wd.setWorkingDirectory(path)
    wd.displayWorkingDirectory()  
}

module.exports = {
    openDialog
}

