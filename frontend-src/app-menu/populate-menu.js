const fileOptions = require('./files-handling/open-file')
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
                    fileOptions.openFile(mainWindow, function (filePath) {
                        var doc = fileOptions.getFileContent(filePath);
                        const monaco = require('./editor/editor')
                        monaco.openDoc(doc, filePath);
                    });
                },
            },
            {
                label: 'open folder',
                click: function () {
                    const wd = require('./files-handling/working-directory');
                    const dialogHandler = require('./files-handling/openDialog')
                    dialogHandler.openDialog(wd.getCurrentWorkingDirectory());
                }
            }
        ]
    }
]
const { Menu } = require('electron').remote
const menu = Menu.buildFromTemplate(template)
Menu.setApplicationMenu(menu)