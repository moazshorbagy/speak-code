const path = require('path')

module.exports = {
    closeApp: function() {
        var unsavedModels = modelsEventEmitters.getUnsavedModels();
        var unsavedUnregisteredModels = modelsEventEmitters.getUnsavedUnregisteredModels();
    
        var allUnsavedModels = unsavedModels.concat(unsavedUnregisteredModels);
    
        if (allUnsavedModels.length == 0) {
            ipcRenderer.send('close-app');
        } else {
            fileNames = [];
            for(let i = 0; i < unsavedModels.length; i++) {
                fileNames.push(unsavedModels[i].split(path.sep).pop());
            }
            fileNames = fileNames.concat(unsavedUnregisteredModels);
            ipcRenderer.send('show-close-app-save-check', fileNames);
        }
    }
}