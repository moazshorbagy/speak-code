const { ipcRenderer } = require('electron');
const wd = require('./files-handling/working-directory');
const editor = require('./editor/editor');
const openedFiles = require('./html-elements/open-editors');