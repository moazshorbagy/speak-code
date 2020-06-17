const codeParser = require('./code-parser');
const commandParser = require('./commands-parser');

var javascriptLang = require('./languages/javascript/javascript-lang.json');
var pythonLang = require('./languages/python/python-lang.json');
var editorCommandsLang = require('./languages/editor-commands-lang.json');
const { ipcMain } = require('electron');

let PythonCodeInserter = require('./languages/python/python.code-inserter');
const JavascriptCodeInserter = require('./languages/javascript/javascript.code-inserter');

let langInserters = {};

// a boolean to detect whether the last word was a command or not.
let constructingEditorCommand;

function isWordNotInGrammar(word, lang) {
    if (word in editorCommandsLang['direct'] || word in editorCommandsLang['indirect'] || word in lang['direct']) {
        return false;
    }
    return true;
}

function isDirectWordInsertion(word, lang) {
    if (word in lang['direct']) {
        return lang['direct'][word];
    }
}

function isDirectCommand(word) {
    if (word in editorCommandsLang['direct']) {
        return editorCommandsLang['direct'][word];
    }
}

function isIndirectCommand(word) {
    if (word in editorCommandsLang['indirect']) {
        return editorCommandsLang['indirect'][word];
    }
}

function processSentence(words, lang) {

    processedWords = [];

    directCodeInsertionDict = lang['direct'];
    direcEditorCommandsDict = editorCommandsLang['direct'];
    indirectEditorCommandsDict = editorCommandsLang['indirect'];

    if (words.length == 1) {
        processedWords.push(words[0]);
    } else {
        for (i = 0; i < words.length - 1; i++) {
            var concatenatedWords = words[i] + '-' + words[i + 1];
            if (Object.keys(directCodeInsertionDict).includes(concatenatedWords) ||
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

    return processedWords;
}

numbersDict = {
    "zero": "0",
    "one": "1",
    "two": "2",
    "three": "3",
    "four": "4",
    "five": "5",
    "six": "6",
    "seven": "7",
    "eight": "8",
    "nine": "9"
};

function formNumbers(words) {
    var numbers = Object.keys(numbersDict);

    var processedWords = [];

    for (let i = 0; i < words.length; i++) {
        number = '';
        if (numbers.includes(words[i])) {
            do {
                number += numbersDict[words[i]];
                i++;
            } while (numbers.includes(words[i]));
            processedWords.push(number);
            if (i < words.length) {
                processedWords.push(words[i]);
            }
        }
        else {
            processedWords.push(words[i]);
        }
    }

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


let lang;

let codeInserter;

// sets the lang and codeInserter variables to the appropriate
// values
function configureLang(filePath) {

    // assume file type based on its extension.
    fileType = filePath.split('.').pop();

    switch (fileType) {
        case 'py': {
            lang = pythonLang;
            if (!Object.keys(langInserters).includes(fileType)) {
                langInserters[fileType] = new PythonCodeInserter();
            }
            break;
        }
        case 'js': {
            lang = javascriptLang;
            if (!Object.keys(langInserters).includes(fileType)) {
                langInserters[fileType] = new JavascriptCodeInserter();
            }
            break;
        }
    }

    codeInserter = langInserters[fileType];
}

// performs the necessary preprocessing
function preprocessing(words) {

    //preprocessing the sentence
    if (typeof words === 'string') {
        words = words.split(' ');
        // building variable name
        if (words.includes('variable')) {
            words = buildVariableName(words);
        }
        words = processSentence(words, lang);
        words = formNumbers(words);
    }

    return words;
}

module.exports = {
    parseCommand: function (mainWindow, words) {

        mainWindow.webContents.send('request-file-path');

        ipcMain.once('file-path', function (event, filePath) {

            configureLang(filePath);

            words = preprocessing(words);

            for (i = 0; i < words.length; i++) {

                cmd = words[i];

                wordNotInGrammar = isWordNotInGrammar(cmd, lang);
                directCode = isDirectWordInsertion(cmd, lang);

                if (constructingEditorCommand) {
                    if (wordNotInGrammar) {
                        commandParser.constructIndicrectCommand(mainWindow, cmd);
                    }
                }
                else {
                    directCommand = isDirectCommand(cmd);
                    indirectCommand = isIndirectCommand(cmd);

                    if (wordNotInGrammar) {
                        codeParser.directCodeInsertion(mainWindow, cmd);
                    } else if (directCode) {
                        codeParser.directCodeInsertion(mainWindow, directCode, codeInserter);
                    } else if (directCommand) {
                        commandParser.executeCommand(mainWindow, directCommand);
                    } else if (indirectCommand) {
                        constructingEditorCommand = true;
                        if (commandParser.constructIndicrectCommand(mainWindow, directCommand)) {
                            constructingEditorCommand = false;
                        }
                    }
                }
            }
        });
    }
}

