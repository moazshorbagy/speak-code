Path = require('path')

checkSaveStateBeforeClosingFile = function (mainWindow, dialog, filePath) {
        buttons = ["Save", "Don't Save", "Return"]
        onCloseUnsavedFileOptions = {
                type: 'warning',
                buttons: buttons,
                message: `There are unsaved changes in file ${filePath.split(Path.sep).pop()}`,
                detail: "You will lose these changes if you don't save them"
        };
        dialog.showMessageBox(onCloseUnsavedFileOptions, (response, checkboxChecked) => {
                decision = buttons[response];
                switch (decision) {
                        case 'Save': {
                                mainWindow.webContents.send('request-save-file');
                                mainWindow.webContents.send('request-close-tab', 'force-close');
                                break;
                        }
                        case "Don't Save": {
                                mainWindow.webContents.send('request-close-tab', 'force-close');
                                break;
                        }
                        default: {
                                return;
                        }
                }
        });
}

module.exports = {
        checkSaveStateBeforeClosingFile
}