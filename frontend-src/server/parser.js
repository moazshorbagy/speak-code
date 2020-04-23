const codeParser = require('./code-parser');
const commandParser = require('./commands-parser');

var language = require('./language.json');

let lastCommand;

let currentCursorPosition;

// updated after every command.
let currentCodeArea;

// is a number: number of tabs
// 0 means global scope 
let currentScope;

let currentFileBeingEdited;

let undoStack = [];

let redoStack = [];

function isDirectWordInsertion(word) {
    if (word in language['direct-code-insertion']) {
        return language[word];
    }
}

function isDirectCommand(word) {
    if (word in language['commands']) {
        if (word in language['commands']['direct-commands']) {
            return language['commands']['direct-commands'][word];
        }
    }
}

function isIndirectCommand(word) {
    if (word in language['commands']) {
        if (word in language['commands']['indirect-commands']) {
            return language['commands']['indirect-commands'][word];
        }
    } 
}

module.exports = {
    parseCommand: function (mainWindow, cmd) {
        var keyword = isDirectWordInsertion(cmd);
        if (keyword) {
            codeParser.insertPlainCode(mainWindow, cmd);
        }
    }
}

