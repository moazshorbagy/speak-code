const remote = require("electron").remote;

var minimise = document.getElementById("minimise");
var maximise = document.getElementById("maximise");
var quit = document.getElementById("quit");

minimise.addEventListener("click", minimizeApp);
maximise.addEventListener("click", maximiseApp);
quit.addEventListener("click", quitApp);

function minimizeApp() {
    remote.BrowserWindow.getFocusedWindow().minimize();
}

function maximiseApp() {
    let win = remote.BrowserWindow.getFocusedWindow();
    if (win.isMaximized()) {
        win.unmaximize();
    } else {
        win.maximize();
    }
}

function quitApp() {
    remote.getCurrentWindow().close();
}