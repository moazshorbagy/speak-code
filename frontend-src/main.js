const electron = require('electron')
const app = electron.app
const globalShortcut = electron.globalShortcut
const BrowserWindow = electron.BrowserWindow
const { spawn } = require('child_process');

const { ipcMain } = require('electron')


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

const zeroRPCServer = require('./server/server');


app.on('ready', function () {
	spawnPythonChild();
	zeroRPCServer.initializeServer();
	createWindow();
});

app.on('window-all-closed', function () {
	if (process.platform !== 'darwin') {
		app.quit()
	}
});

function spawnPythonChild() {
	spawnedChild = spawn('python3', ['python-client.py']);

	spawnedChild.on('close', (code, signal) => {
		console.log(`child error: ${code}, ${signal}`);
	});
	spawnedChild.on('error', (err) => console.error(err));

}



app.whenReady().then(() => {
	globalShortcut.register('CommandOrControl+S', () => {
	  mainWindow.webContents.send('save-file')
	})
  }).catch((e) => {
	console.log(e);
  });

app.on('activate', function () {
	if (mainWindow === null) {
		createWindow()
	}
})
