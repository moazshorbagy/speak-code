const electron = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const { spawn, spawnSync } = require('child_process');

const ipcMain = electron.ipcMain;

const dialog = electron.dialog;

const msgBox = require('./files-handling/message-box')

const saveFileDialog = require('./files-handling/save-file-dialog');

const parser = require('./server/parser')

let mainWindow;

let showExitPrompt = true;

function createWindow() {
	var screenElectron = electron.screen;
	mainWindow = new BrowserWindow({
		width: screenElectron.getPrimaryDisplay().size.width * (2 / 3),
		height: screenElectron.getPrimaryDisplay().size.height * (4 / 5),
		webPreferences: {
			nodeIntegration: true
		},
	});
	mainWindow.loadURL(`file://${__dirname}/renderer-process/electron-index.html`)
	mainWindow.webContents.openDevTools()
	mainWindow.on('close', function(e) {
		if(showExitPrompt) {
			e.preventDefault();
			mainWindow.webContents.send('request-exit-app');
		} else {
			showExitPrompt = true;
		}
	});
	mainWindow.on('closed', function () {
		mainWindow = null;
	});
}

const zeroRPCServer = require('./server/server');

let spawnedChild;

app.on('ready', function () {
	createWindow();
	zeroRPCServer.initializeServer();
	spawnPythonChild();
});

app.on('renderer-process-crashed', function () {
	createWindow();
});

app.on('window-all-closed', function () {
	spawnedChild.kill('SIGINT');
	if (process.platform !== 'darwin') {
		app.quit()
	}
});

function spawnPythonChild() {

	let recognizerPath = '../backend-src/seq2seq_recognizer.py';

	if (process.platform == 'win32') {
		let activateConda = spawnSync('conda', ['activate'], options={
			encoding: 'utf8'
		});
		if(activateConda.error) {
			console.log('failed to activate conda environment: ' + activateConda.error);
		}
		spawnedChild = spawn('python', [recognizerPath], options = {
			encoding: 'utf8'
		});
	} else if (process.platform == 'linux' || process.platform == 'darwin') {
		spawnedChild = spawn('python3', [recognizerPath], {
			stdio: 'inherit',
			shell: true
		});
	}

	if (spawnedChild) {
		spawnedChild.on('close', (code, signal) => {
			console.log(`child closed: ${code}, ${signal}`);
		});

		spawnedChild.on('error', (err) => console.error(err));
	}

}

const folderOptions = require('./files-handling/open-directory');

ipcMain.on('open-folder', (event, prevPath) => {
	folderOptions.openDirectory(mainWindow, dialog, event, prevPath);
});

const fileOptions = require('./files-handling/open-file')

ipcMain.on('open-file', (event, args) => {
	fileOptions.openFile(mainWindow, dialog, event);
});

ipcMain.on('open-file-save-check-message-box', (event, filePath) => {
	msgBox.checkSaveStateBeforeClosingFile(mainWindow, dialog, filePath);
});

ipcMain.on('open-save-dialog', (event, args) => {
	saveFileDialog.showSaveDialog(mainWindow, dialog, args);
});

ipcMain.on('close-app', function (event, args) {
	showExitPrompt = false;
	mainWindow.close();
	spawnedChild.kill('SIGINT');
	if (process.platform !== 'darwin') {
		app.quit()
	}
});

ipcMain.on('show-close-app-save-check', function (event, fileNames) {
	console.log(fileNames);
	msgBox.closeAppSaveCheck(mainWindow, dialog, fileNames);
});

ipcMain.on('toggle-is-listening', (event, arg) => {
	event.returnValue = parser.toggleIsListening();
});

app.on('activate', function () {
	if (mainWindow === null) {
		createWindow()
	}
	spawnPythonChild();
})
