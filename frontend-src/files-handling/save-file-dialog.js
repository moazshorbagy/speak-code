const { ipcMain } = require('electron');

fs = require('fs')

showSaveDialog = function (mainWindow, dialog, filePath) {
    options = {
        defaultPath: filePath
    }
    console.log(filePath);
    dialog.showSaveDialog(mainWindow, options, (newPath) => {
        console.log(newPath)
        mainWindow.webContents.send('request-file-content', filePath);
        ipcMain.once('file-content', (event, content) => fs.writeFileSync(newPath, content, { encoding: 'utf-8' }));
    });
}
module.exports = {
    showSaveDialog
}