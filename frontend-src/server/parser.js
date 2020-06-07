const codeParser = require('./code-parser');
const commandParser = require('./commands-parser');

var language = require('./language.json');

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

function processSentence(words) {

    processedWords = [];

    console.log(words);

    directCodeInsertionDict = language['code-insertion']['direct'];
    indirectCodeInsertionDict = language['code-insertion']['indirect'];
    direcEditorCommandsDict = language['editor-commands']['direct'];
    indirectEditorCommandsDict = language['editor-commands']['indirect'];

    if (words.length == 1) {
        processedWords.push(words[0]);
    } else {
        for (i = 0; i < words.length - 1; i++) {
            var concatenatedWords = words[i] + '-' + words[i + 1];
            if (Object.keys(directCodeInsertionDict).includes(concatenatedWords) || Object.keys(indirectCodeInsertionDict).includes(concatenatedWords) ||
                Object.keys(direcEditorCommandsDict).includes(concatenatedWords) || Object.keys(indirectEditorCommandsDict).includes(concatenatedWords)) {
                processedWords.push(concatenatedWords);
                i++;
            } else {
                processedWords.push(words[i]);
            }

            if (i == words.length - 2) {
                processedWords.push(words[i + 1]);
            }
        }
    }


    console.log(processedWords);

    return processedWords;
}





function buildVariableName(words) {

    wordsAfterCombiningVarName = [];

    for (i = 0; i < words.length; i++) {
        if (words[i] === 'variable') {

            // to get the convention desired
            i++;

            j = i;

            while (words[i] !== 'case' && i < words.length) {
                i++;
            }

            // either 'camel', 'snake' or 'pascal'
            convention = words[i - 1];

            switch (convention) {

                case 'camel': {

                    varName = words[j];

                    for (k = j + 1; k < i - 1; k++) {
                        varName += words[k].charAt(0).toUpperCase() + words[k].slice(1);
                    }
                    break;
                }
                case 'snake': {

                    varName = words[j];

                    for (k = j + 1; k < i - 1; k++) {
                        varName += "_" + words[k];
                    }
                    break;
                }
                case 'pascal': {
                    for (k = j; k < i - 1; k++) {
                        varName += words[k].charAt(0).toUpperCase() + words[k].slice(1);
                    }
                    break;
                }
                default: {
                    varName = words[j];
                    for (k = i + 1; k < i - 1; k++) {
                        varName += words[k];
                    }
                    break;
                }
            }

            wordsAfterCombiningVarName.push(varName);

        } else {
            wordsAfterCombiningVarName.push(words[i]);
        }
    }

    return wordsAfterCombiningVarName;
}


module.exports = {
    parseCommand: function (mainWindow, words) {

        //preprocessing the sentence
        if (typeof words === 'string') {
            words = words.split(' ');
            // building variable name
            if (words.includes('variable')) {
                words = buildVariableName(words);
            }
            words = processSentence(words);
        }

        for (i = 0; i < words.length; i++) {

            cmd = words[i];
            // if the user says cancel, the buffer of creating commands
            // or code blocks is flushed.
            if (cancelCommandOrCodeBlockCreation(cmd)) {
                continue;
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
            } else {
                directCommand = isDirectCommand(cmd);
                indirectCommand = isIndirectCommand(cmd);

                if (wordNotInGrammar) {
                    codeParser.directCodeInsertion(mainWindow, cmd);
                } else if (directCode) {
                    codeParser.directCodeInsertion(mainWindow, directCode);
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
}

