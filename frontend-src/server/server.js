const zerorpc = require('zerorpc');
const {BrowserWindow} = require('electron');
const commandsParser = require('./commands-parser');
// const codeParser = require('./code-parser');

let server;

var port = '4242';

let shouldStartRecording;

let mainWindow;

initializeServer = function() {
    server = new zerorpc.Server({
        shouldStartRecording: function () {
            return shouldStartRecording;
        },

        // parsing the command here means only knowing exactly what the command is
        // then it will sent as an event to the renderer process if it needs to.
        // through mainWindow.webContents.send() function. 
        sendData: function (command, reply) {
            try {
                mainWindow = BrowserWindow.getAllWindows()[0];
                var cmd = commandsParser.parseCommand(mainWindow, command);
                // if(cmd === false) {
                //     cmd = codeParser.parseCode(command);
                // } 
                //if all is okay, reply with a success to the python client.
                reply(null, 'ok');
            } catch(e) {
                console.log(e);
                reply("error", "not ok");
            }
        },
    }, 30000);

    server.bind("tcp://0.0.0.0:" + port);

    server.on("error", function(error) {
        console.error("RPC server error:", error);
    });
}

setShouldStartRecording = function (startRecording) {
    shouldStartRecording = startRecording;
}

module.exports = {
    initializeServer
}