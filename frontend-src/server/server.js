const zerorpc = require('zerorpc');

const Events = require('events');

const {BrowserWindow} = require('electron');

let server;

var port = '4242';

let shouldStartRecording;

let mainWindow

initializeServer = function() {

    server = new zerorpc.Server({
        shouldStartRecording: function () {
            return shouldStartRecording;
        },

        sendData: function (data, reply) {
            mainWindow = BrowserWindow.getAllWindows()[0];
            mainWindow.webContents.send('insert-text', {msg: data});
            reply(null, 'ok')
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