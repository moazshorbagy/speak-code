const remote = require("electron").remote;

let minimize = document.getElementById("minimize");
let maximize = document.getElementById("maximize");
let quit = document.getElementById("quit");

minimize.addEventListener("click", minimizeApp);
maximize.addEventListener("click", maximiseApp);
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