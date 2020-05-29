const fs = require('fs')

getFileContent = function(file) {
    return fs.readFileSync(file, "utf8")
}

openFile = function (mainWindow, dialog, event) {
	dialog.showOpenDialog(mainWindow, {
		properties: ['openFile']
	}).then(result => {
		if (!result.canceled) {
            var filePath = result.filePaths[0]; 
            var doc = module.exports.getFileContent(filePath);
			event.sender.send('chosen-file', {doc, filePath});
		}
	}).catch(err => {
		console.log(err)
	});
}

module.exports = { openFile, getFileContent }