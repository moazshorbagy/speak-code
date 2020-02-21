const { app, BrowserWindow } = require('electron')

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win

function createWindow() {
  // Create the browser window.

  if (process.platform == "darwin") {
    win = new BrowserWindow({
      width: 900,
      height: 800,
      minHeight: 650,
      minWidth: 600,
      frame: true,
      webPreferences: { nodeIntegration: true }
    })
  } else {
    win = new BrowserWindow({
      width: 900,
      height: 800,
      minHeight: 650,
      minWidth: 600,
      frame: false,
      webPreferences: { nodeIntegration: true }
    })
  }

  // and load the index.html of the app.
  win.loadFile('codeeditor.html')
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', function () {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})