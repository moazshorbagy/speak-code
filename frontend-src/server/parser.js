const codeParser = require('./code-parser');
const commandParser = require('./commands-parser');

var javascriptLang = require('./languages/javascript/javascript-lang.json');
var pythonLang = require('./languages/python/python-lang.json');
var editorCommandsLang = require('./languages/editor-commands-lang.json');
const { ipcMain } = require('electron');

let PythonCodeInserter = require('./languages/python/python.code-inserter');
const JavascriptCodeInserter = require('./languages/javascript/javascript.code-inserter');

let langInserters = {};

// a boolean that determines whether to listen or discard commands
let isListening = false;

// a boolean to detect whether the last word was a command or not.
let constructingEditorCommand;

function isWordNotInGrammar(word, lang) {
    if (!lang || !word) {
        throw new Error('Missing parameters.')
    }
    if (typeof (word) != "string") {
        throw TypeError(`Expected word to be string but instead got ${typeof (words)}`);
    }

    if (word in editorCommandsLang['direct'] || word in editorCommandsLang['indirect'] || word in lang['direct']) {
        return false;
    }

    return true;
}

function isDirectWordInsertion(word, lang) {
    if (lang) {
        if (word in lang['direct']) {
            return lang['direct'][word];
        }
    }

    return undefined;
}

function isDirectCommand(word) {
    if (word in editorCommandsLang['direct']) {
        return editorCommandsLang['direct'][word];
    }

    return undefined;
}

function isIndirectCommand(word) {
    if (word in editorCommandsLang['indirect']) {
        return editorCommandsLang['indirect'][word];
    }

    return undefined;
}

function formEditorCommands(words) {

    if (!words || !words.length) {
        throw new Error('Missing parameters.')
    }

    if (!Array.isArray(words)) {
        throw TypeError(`Expected words to array but instead got ${typeof (words)}`);
    }

    processedWords = [];

    directEditorCommandsDict = editorCommandsLang['direct'];
    indirectEditorCommandsDict = editorCommandsLang['indirect'];

    if (words.length == 1) {
        processedWords.push(words[0]);
    } else {
        for (i = 0; i < words.length - 1; i++) {

            let concatenatedWords = words[i] + '-' + words[i + 1];

            if (Object.keys(directEditorCommandsDict).includes(concatenatedWords) ||
                Object.keys(indirectEditorCommandsDict).includes(concatenatedWords)) {
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

function formLangCommands(words, lang) {

    if (!lang || !words || !words.length) {
        throw new Error('Missing parameters.')
    }
    if (!Array.isArray(words)) {
        throw TypeError(`Expected words to be array but instead got ${typeof (words)}`);
    }

    processedWords = [];

    let directCodeInsertionDict = lang['direct'];

    if (words.length == 1) {
        processedWords.push(words[0]);
    } else {
        for (i = 0; i < words.length - 1; i++) {

            let concatenatedWords = words[i] + '-' + words[i + 1];

            if (Object.keys(directCodeInsertionDict).includes(concatenatedWords)) {
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
    if (!words || !words.length) {
        throw new Error('Missing parameters.')
    }
    if (!Array.isArray(words)) {
        throw TypeError(`Expected words to array but instead got ${typeof (words)}`);
    }

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

function formNonEnglishWords(words) {
    processedWords = [];

    for (let i = 0; i < words.length; i++) {
        if (words[i] === 'strange') {
            let word = '';
            i++;
            while (words[i] !== 'strange' && i < words.length) {
                word += words[i].charAt(0);
                i++;
            }
            processedWords.push(word);
        } else {
            processedWords.push(words[i]);
        }
    }
    return processedWords;
}


function buildVariableName(words) {
    if (!words || !words.length) {
        throw new Error('Missing parameters.')
    }
    if (!Array.isArray(words)) {
        throw TypeError(`Expected words to array but instead got ${typeof (words)}`);
    }

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

                    varName = "";

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


// sets the lang and codeInserter variables to the appropriate
// values
function configureLang(filePath) {
    let lang, codeInserter;

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

    return { lang, codeInserter };
}

function startStopListening(words) {
    let processedWords = [];
    for (i = 0; i < words.length; i++) {
        if (words[i] === 'start-listening' && !isListening) {
            isListening = true;
            continue;
        }
        if (words[i] === 'stop-listening' && isListening) {
            isListening = false;
            continue;
        }
        if(words[i] === 'start-listening' && isListening) {
            continue;
        }
        if(words[i] === 'stop-listening' && !isListening) {
            continue;
        }
        if (isListening === true) {
            processedWords.push(words[i]);
        }
    }
    return processedWords;
}

function preprocessing1(words) {

    //preprocessing the sentence
    if (typeof words === 'string') {
        words = words.split(' ');

        // building variable name
        if (words.includes('variable')) {
            words = buildVariableName(words);
        }
        try {
            words = formEditorCommands(words);

            words = startStopListening(words);

            words = formNonEnglishWords(words);
    
            words = formNumbers(words);
        } catch(e) {
            console.log(words);
        }
    }

    return words;
}

// performs preprocessing to form the language specific commands
function preprocessing2(words, lang) {

    try {
        words = formLangCommands(words, lang);
    } catch(e) {
        console.log(words);
    }

    return words;
}

function parseCommand(mainWindow, words) {

    words = preprocessing1(words);

    mainWindow.webContents.send('request-file-path');

    ipcMain.once('file-path', function (event, filePath) {

        let lang, codeInserter;

        if (filePath) {
            config = configureLang(filePath);
            lang = config['lang'];
            codeInserter = config['codeInserter'];
        }
        if(lang) {
            words = preprocessing2(words, lang);
        }

        let wordNotInGrammar, directCode;

        for (i = 0; i < words.length; i++) {

            cmd = words[i];

            if (lang) {
                wordNotInGrammar = isWordNotInGrammar(cmd, lang);
                directCode = isDirectWordInsertion(cmd, lang);
            }

            if (constructingEditorCommand) {
                commandParser.constructIndicrectCommand(mainWindow, cmd, true);
                constructingEditorCommand = false;
            }
            else {

                let directCommand = isDirectCommand(cmd);
                let indirectCommand = isIndirectCommand(cmd);

                if (wordNotInGrammar) {
                    codeParser.directCodeInsertion(mainWindow, cmd);
                } else if (directCode !== undefined) {
                    codeParser.directCodeInsertion(mainWindow, directCode, codeInserter);
                } else if (directCommand !== undefined) {
                    commandParser.executeCommand(mainWindow, directCommand);
                } else if (indirectCommand !== undefined) {
                    constructingEditorCommand = true;
                    commandParser.constructIndicrectCommand(mainWindow, indirectCommand);
                }
            }
        }
    });
}

module.exports = {
    isWordNotInGrammar,
    formLangCommands,
    formNumbers,
    buildVariableName,
    preprocessing1,
    preprocessing2,
    configureLang,
    parseCommand,
    formEditorCommands,
    formNonEnglishWords
}
