Path = require('path')

checkSaveStateBeforeClosingFile = function (mainWindow, dialog, args) {
        filePath = args['filePath'];
        type = args['type'];
        buttons = ["Save", "Don't Save", "Return"]
        onCloseUnsavedFileOptions = {
                type: 'warning',
                buttons: buttons,
                message: `There are unsaved changes in\n ${filePath.split(Path.sep).pop()}`,
                detail: "You will lose these changes if you don't save them.",
                defaultId: 0
        };
        dialog.showMessageBox(onCloseUnsavedFileOptions, (response, checkboxChecked) => {
                decision = buttons[response];
                switch (decision) {
                        case 'Save': {
                                if (type === 'unregistered') {
                                        var isRegistered = false;
                                        mainWindow.webContents.send('request-save-as', {filePath, isRegistered});
                                        mainWindow.webContents.send('request-close-tab', 'force-close');
                                } else {
                                        mainWindow.webContents.send('request-save-file');
                                        mainWindow.webContents.send('request-close-tab', 'force-close');
                                }
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

closeAppSaveCheck = function(mainWindow, dialog, fileNames) {
        buttons = ["Don't Save", "Return"];
        message = 'There are unsaved changes in the following files:';
        details = fileNames;
        details.push("You will lose these changes if you don't save them.");
        details = details.join('\n');
        options = {
                type: 'warning',
                buttons: buttons,
                message: message,
                detail: details,
                defaultId: 0
        };
        dialog.showMessageBox(options, function(response, checkboxChecked) {
                decision = buttons[response];
                switch(decision) {
                        case 'Don\'t Save': {
                                mainWindow.webContents.send('request-close-app');
                                break;
                        }
                        default: {
                                return;
                        }
                }
        });
}

module.exports = {
        checkSaveStateBeforeClosingFile,
        closeAppSaveCheck
}