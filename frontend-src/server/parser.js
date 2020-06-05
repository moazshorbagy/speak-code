const codeParser = require('./code-parser');
const commandParser = require('./commands-parser');

var language = require('./language.json');

let lastCommand;

let currentCursorPosition;

// a boolean to detect whether the last word was a command or not.
let constructingCommand;

// a boolean to track if a current command or code bloc
// is being formed
let commandIsBeingConstructed;

// is a number: number of tabs
// 0 means global scope 
let currentScope;

let currentFileBeingEdited;

let undoStack = [];

let redoStack = [];


function cancelCommandOrCodeBlockCreation(word) {
    if (word in language['cancel-executing-indirects']) {
        codeParser.cancelConstructingCodeblock();
        commandParser.cancelCostructingCommand();
    }
}

function isWordNotInGrammar(word) {
    if (word in language['cancel-executing-indirects'] || word in language['editor-commands']['direct'] || word in language['editor-commands']['indirect'] || word in language['code-insertion']['direct'] || word in language['code-insertion']['indirect']) {
        return false;
    }
    return true;
}

function isDirectWordInsertion(word) {
    if (word in language['code-insertion']['direct']) {
        return language['code-insertion']['direct'][word];
    }
}

function isIndirectCodeInsertion(word) {
    if (word in language['code-insertion']['indirect']) {
        commandIsBeingConstructed = true;
        constructingCommand = false;
        return language['code-insertion']['indirect'][word];
    }
}

function isDirectCommand(word) {
    if (word in language['editor-commands']['direct']) {
        return language['editor-commands']['direct'][word];
    }
}

function isIndirectCommand(word) {
    if (word in language['editor-commands']) {
        if (word in language['editor-commands']['indirect']) {
            commandIsBeingConstructed = true;
            constructingCommand = true;
            return language['editor-commands']['indirect'][word];
        }
    }
}

module.exports = {
    parseCommand: function (mainWindow, cmd) {
        // if the user says cancel, the buffer of creating commands
        // or code blocks is flushed.
        if (cancelCommandOrCodeBlockCreation(cmd)) {
            return;
        }

        wordNotInGrammar = isWordNotInGrammar(cmd);
        directCode = isDirectWordInsertion(cmd);
        indicrectCode = isIndirectCodeInsertion(cmd);

        if (commandIsBeingConstructed) {
            if (constructingCommand) {
                if (wordNotInGrammar) {
                    commandParser.constructIndicrectCommand(mainWindow, cmd);
                }
            } else {
                if (wordNotInGrammar) {
                    codeParser.constructIndicrectCodeBlock(mainWindow, cmd);
                } else {
                    if (directCode) {
                        codeParser.constructIndicrectCodeBlock(mainWindow, directCode);
                    } else if (indicrectCode) {
                        codeParser.constructIndicrectCodeBlock(mainWindow, indicrectCode);
                    }
                }
            }
            return;
        } else {
            directCommand = isDirectCommand(cmd);
            indirectCommand = isIndirectCommand(cmd);

            if (wordNotInGrammar) {
                codeParser.insertDirectCode(mainWindow, cmd);
            } else if (directCode) {
                codeParser.insertDirectCode(mainWindow, directCode);
            } else if (indicrectCode) {
                if (codeParser.constructIndicrectCodeBlock(mainWindow, indicrectCode)) {
                    commandIsBeingConstructed = false;
                }
            } else if (directCommand) {
                commandParser.executeCommand(mainWindow, directCommand);
            } else if (indirectCommand) {
                if (commandParser.constructIndicrectCommand(mainWindow, directCommand)) {
                    commandIsBeingConstructed = false;
                }
            }
        }


    }
}

