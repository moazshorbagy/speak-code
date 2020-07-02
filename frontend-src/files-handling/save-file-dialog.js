const { ipcMain } = require('electron');

fs = require('fs');

showSaveDialog = function (mainWindow, dialog, args) {
    filePath = args['filePath'];
    isRegistered = args['isRegistered'];
    closeAfterSave = args['closeAfterSave'];
    options = {
        defaultPath: filePath
    }
    dialog.showSaveDialog(mainWindow, options, (newPath) => {
        if(newPath) {
            mainWindow.webContents.send('request-file-content', filePath);
            ipcMain.once('file-content', (event, content) => fs.writeFileSync(newPath, content, { encoding: 'utf-8' }));
            if(closeAfterSave) {
                mainWindow.webContents.send('request-confirm-close');
                return;
            }
            if(isRegistered === false) {
                oldName = filePath;
                mainWindow.webContents.send('request-register-file', {oldName, newPath});
            }
        }
    });
}
module.exports = {
    showSaveDialog
}