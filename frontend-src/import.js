const { ipcRenderer } = require('electron');
const wd = require('./files-handling/working-directory');
const editor = require('./editor/editor');
const openedFiles = require('./html-elements/open-editors');
const collapsible = require('./html-elements/collapsible');
const modelsEventEmitters = require('./editor/model-did-change-event');