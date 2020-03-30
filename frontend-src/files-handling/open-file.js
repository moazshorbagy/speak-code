function mapExtention2DocType(ext) {
    if (ext == 'js') {
        return 'javascript'
    } else if (ext == 'py') {
        return 'python'
    } else return 'javascript'
}


const fs = require('fs')
const { dialog } = require('electron').remote

getFileContent = function(file) {
    return fs.readFileSync(file, "utf8")
}

openFile = function (mainWindow, callback) {
    var filePath = null;
    var resultCancelled = null

    dialog.showOpenDialog(mainWindow, {
        properties: ['openFile']
    }).then(result => {
        //if the result is cancelled
        resultCancelled = result.canceled;
        filePath = result.filePaths[0].toString();
        var tokenized = filePath.split('.')
        var extension = tokenized[tokenized.length - 1]
        type = mapExtention2DocType(extension)
        if (!resultCancelled) {
            callback(filePath);
        }
    }).catch(err => {
        console.log(err)
    });
}

module.exports = { openFile, getFileContent }