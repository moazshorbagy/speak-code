
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
                click: function() {
                    ipcRenderer.send('open-save-dialog', editor.getCurrentModel());
                },
                accelerator: process.platform === 'darwin' ? 'Cmd+Shift+S' : 'Ctrl+Shift+S',
            }
        ]
    }
]
const { Menu } = require('electron').remote
const menu = Menu.buildFromTemplate(template)
Menu.setApplicationMenu(menu)