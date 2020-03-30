// import { readdirSync } from 'fs';

currentWorkingDirectory = null;
const fs = require('fs')

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
        this.openSubDir(currentWorkingDirectory, explorerContainer);

    },

    openSubDir: function (path, explorerContainer) {
        files = fs.readdirSync(path, { withFileTypes: true });

        const collapsible = require('./../html-elements/collapsible')

        folderName = path.split('/').pop();

        collapsible.addCollapsible(explorerContainer, path.split('/').join(''), path, folderName, files);
    }
}