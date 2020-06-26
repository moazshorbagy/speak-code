// import { readdirSync } from 'fs';

currentWorkingDirectory = null;
const fs = require('fs')
const Path = require('path')

let explorerContainer = $('#folders-panel');

module.exports = {
    getCurrentWorkingDirectory: function () {
        return currentWorkingDirectory;
    },

    setWorkingDirectory: function (dir) {
        currentWorkingDirectory = dir;
    },

    displayWorkingDirectory: function () {
        explorerContainer.empty();
        openedFiles.addOpenEditors();
        this.openSubDir(currentWorkingDirectory, explorerContainer);
    },

    openSubDir: function (path, explorerContainer) {
        files = fs.readdirSync(path, { withFileTypes: true });

        folderName = path.split(Path.sep).pop();

        collapsible.addCollapsible(explorerContainer, path, folderName, files, true);
    }
}