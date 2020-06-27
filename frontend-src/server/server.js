const zerorpc = require('zerorpc');
const { BrowserWindow, ipcMain } = require('electron');
// const commandsParser = require('./commands-parser');
const parser = require('./parser');
const commandsParser = require('./commands-parser');

let server;

var port = '4242';

let shouldStartRecording;

let mainWindow;

initializeServer = function () {
    server = new zerorpc.Server({
        shouldStartRecording: function () {
            return shouldStartRecording;
        },

        // parsing the command here means only knowing exactly what the command is
        // then it will sent as an event to the renderer process if it needs to.
        // through mainWindow.webContents.send() function. 
        sendData: function (words, reply) {
            try {
                mainWindow = BrowserWindow.getAllWindows()[0];
                parser.parseCommand(mainWindow, words);

                // if all is okay.
                reply(null, 'ok');
            } catch (e) {
                console.log(e);
                reply("error", "failed to execute command");
            }
        },

        setDirectory: function (directory, reply) {
            try {
                mainWindow = BrowserWindow.getAllWindows()[0];
                mainWindow.webContents.send('chosen-directory', directory);

                commandsParser.setRootDirectory(mainWindow, directory);

                reply(null, 'ok');
            } catch (e) {
                console.log(e);
                reply("error", "failed to set directory");
            }
        }

        
    }, 30000);

    server.bind("tcp://0.0.0.0:" + port);

    server.on("error", function (error) {
        console.error("RPC server error:", error);
    });
}

setShouldStartRecording = function (startRecording) {
    shouldStartRecording = startRecording;
}

module.exports = {
    initializeServer
}