const electron = require('electron');
const app = electron.app;
const globalShortcut = electron.globalShortcut;
const BrowserWindow = electron.BrowserWindow;
const { spawn } = require('child_process');

const ipcMain = electron.ipcMain;

const dialog = electron.dialog;

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

let spawnedChild;

app.on('ready', function () {
	createWindow();
	zeroRPCServer.initializeServer();

	// start the python client after 100 ms to ensure all renderer process scripts are run.
	setTimeout(function() {
		spawnPythonChild();
	}, 100);

});

app.on('window-all-closed', function () {
	if (process.platform !== 'darwin') {
		app.quit()
	}
});

function spawnPythonChild() {
	spawnedChild = spawn('python', ['python-client.py']);

	spawnedChild.on('close', (code, signal) => {
		console.log(`child closed: ${code}, ${signal}`);
	});
	spawnedChild.on('error', (err) => console.error(err));

}

const folderOptions = require('./files-handling/open-directory');

ipcMain.on('open-folder', (event, prevPath) => {
	folderOptions.openDirectory(mainWindow, dialog, event, prevPath);
});

const fileOptions = require('./files-handling/open-file')

ipcMain.on('open-file', (event, args) => {
	fileOptions.openFile(mainWindow, dialog, event);
});

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
