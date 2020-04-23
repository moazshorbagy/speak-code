const codeParser = require('./code-parser');
const commandParser = require('./commands-parser');

var language = require('./language.json');

let lastCommand;

let currentCursorPosition;

// a boolean to detect whether the last word was a command or not.
let lastWordIsCommand;

// a boolean to track if a current command or code bloc
// is being formed
let commandIsBeingConstructed;

// is a number: number of tabs
// 0 means global scope 
let currentScope;

let currentFileBeingEdited;

let undoStack = [];

let redoStack = [];

function isDirectWordInsertion(word) {
    if (word in language['direct-code-insertion']) {
        commandIsBeingConstructed = false;
        return language['indirect-code-insertion'][word];
    }
}

function isWordNotInGrammar(word) {
    if (word in language) {
        return true;
    }
    return false;
}

function isDirectCommand(word) {
    if (word in language['commands']) {
        if (word in language['commands']['direct-commands']) {
            commandIsBeingConstructed = false;
            return language['commands']['direct-commands'][word];
        }
    }
}

function cancelCommandOrCodeBlockCreation(word) {
    if (word in language['cancel-executing-indirects']) {
        codeParser.cancelConstructingCommand();
        commandParser.cancelConstructingCodeBlock();
    }
}

function isIndirectCodeInsertion(word) {
    if (word in language['indirect-code-insertion']) {
        commandIsBeingConstructed = true;
        return language['indirect-code-insertion'][word];
    }
}

function isIndirectCommand(word) {
    if (word in language['commands']) {
        if (word in language['commands']['indirect-commands']) {
            commandIsBeingConstructed = true;
            return language['commands']['indirect-commands'][word];
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

        // if the word is not in the language, then there is 2 possibilities:
        // the word would be directly inserted to the editor, or the 
        // word is part of a command being constructed in 
        // either codeaParser, or commandParser. 
        var complementary = isWordNotInGrammar(cmd);
        if (complementary) {
            if (commandIsBeingConstructed) {
                if (lastWordIsCommand) {
                    commandParser.constructIndicrectCommand(mainWindow, complementary);
                } else {
                    codeParser.constructIndicrectCodeBlock(mainWindow, complementary);
                }
            } else {
                codeParser.insertPlainCode(mainWindow, complementary);
            }
        }

        var keyword = isDirectWordInsertion(cmd);
        if (keyword) {
            codeParser.insertPlainCode(mainWindow, keyword);
            return;
        }


        keyword = isDirectCommand(cmd);
        if (keyword) {
            commandParser.executeCommand(mainWindow, keyword);
            return;
        }

        keyword = isIndirectCodeInsertion(cmd);
        if (keyword) {
            codeParser.createCodeInsertionBlock(keyword);
            return;
        }

        keyword = isIndirectCommand(cmd);
        if (keyword) {
            commandParser.createIndicrectCommand(keyword);
        }
    }
}

