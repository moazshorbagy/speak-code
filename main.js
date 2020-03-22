const electron = require('electron')
const zerorpc = require('zerorpc')
const app = electron.app
const BrowserWindow = electron.BrowserWindow


let mainWindow;

function createWindow() {
	var screenElectron = electron.screen;
	mainWindow = new BrowserWindow({
		width: screenElectron.getPrimaryDisplay().size.width * (2 / 3),
		height: screenElectron.getPrimaryDisplay().size.height * (4 / 5),
		webPreferences: {
			nodeIntegration: true
		},
	});
	mainWindow.loadURL(`file://${__dirname}/electron-index.html`)
	mainWindow.webContents.openDevTools()
	mainWindow.on('closed', function () {
		mainWindow = null
	})
}

app.on('ready', createWindow);

app.on('window-all-closed', function () {
	if (process.platform !== 'darwin') {
		app.quit()
	}
})

app.on('activate', function () {
	if (mainWindow === null) {
		createWindow()
	}
})
