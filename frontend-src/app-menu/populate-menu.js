
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
                label: 'open file',
                click: function () {
                    ipcRenderer.send('open-file');
                },
                accelerator: process.platform === 'darwin' ? 'Cmd+Shift+O' : 'Ctrl+Shift+O',
            },
            {
                label: 'open folder',
                click: function () {
                    ipcRenderer.send('open-folder', wd.getCurrentWorkingDirectory());
                },
                accelerator: process.platform === 'darwin' ? 'Cmd+O' : 'Ctrl+O',
            },
            {
                label: 'save file',
                click: function () {
                    editor.saveFile();
                },
                accelerator: process.platform === 'darwin' ? 'Cmd+S' : 'Ctrl+S',
            }
        ]
    }
]
const { Menu } = require('electron').remote
const menu = Menu.buildFromTemplate(template)
Menu.setApplicationMenu(menu)