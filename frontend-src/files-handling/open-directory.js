const commandsParser = require('./../server/commands-parser');


openDirectory = function(mainWindow, dialog, event, prevPath) {
    dialog.showOpenDialog(mainWindow, {
        properties: ['openDirectory']
    }).then(result => {
        if(!result.canceled) {
            var filePath = result.filePaths[0];
            if(filePath !== prevPath) {
                event.sender.send('chosen-directory', filePath);
                commandsParser.setRootDirectory(mainWindow, filePath);
            } else {
                console.log('same directory');
            }
        }
    }).catch(err => {
        console.log(err)
    });
}


module.exports = {
    openDirectory
}

