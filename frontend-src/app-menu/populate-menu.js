const closeApp = require('./close-app');


const template = [
    {
        label: 'VoiceProgramming',
        submenu: [
            {
                label: 'Preferences',
            },
            {
                label: 'Check for updates'
            },
            {
                type: 'separator'
            },
            {
                label: 'Services'
            }
        ]
    },
    {
        label: 'File',
        submenu: [
            {
                label: 'New File',
                click: function () {
                    openedFiles.openNewFile();
                },
                accelerator: process.platform === 'darwin' ? 'Cmd+N' : 'Ctrl+N',
            },
            {
                type: 'separator'
            },
            {
                label: 'Open File',
                click: function () {
                    ipcRenderer.send('open-file');
                },
                accelerator: process.platform === 'darwin' ? 'Cmd+Shift+O' : 'Ctrl+Shift+O',
            },
            {
                label: 'Open Folder',
                click: function () {
                    ipcRenderer.send('open-folder', wd.getCurrentWorkingDirectory());
                },
                accelerator: process.platform === 'darwin' ? 'Cmd+O' : 'Ctrl+O',
            },
            {
                type: 'separator'
            },
            {
                label: 'Save File',
                click: function () {
                    editor.saveFile();
                },
                accelerator: process.platform === 'darwin' ? 'Cmd+S' : 'Ctrl+S',
            },
            {
                label: 'Save File As',
                click: function () {
                    var filePath = editor.getCurrentModel();
                    if (filePath != undefined) {
                        var isRegistered = editor.modelIsRegistered(filePath);
                        ipcRenderer.send('open-save-dialog', { filePath, isRegistered });
                    }
                },
                accelerator: process.platform === 'darwin' ? 'Cmd+Shift+S' : 'Ctrl+Shift+S',
            },
            {
                type: 'separator'
            },
            {
                label: 'Close File',
                click: function () {
                    openedFiles.closeTab(editor.getCurrentModel(), false);
                },
                accelerator: process.platform === 'darwin' ? 'Cmd+W' : 'Ctrl+W',
            },
            {
                label: 'Close App',
                click: function () {
                    closeApp.closeApp();
                },
                accelerator: process.platform === 'darwin' ? 'Cmd+Shift+W' : 'Ctrl+Shift+W',
            },
        ]
    }
]

const { Menu } = require('electron').remote
const menu = Menu.buildFromTemplate(template)
Menu.setApplicationMenu(menu)