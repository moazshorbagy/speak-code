const path = require('path');
const fs = require('fs');

function uriFromPath(_path) {
    var pathName = path.resolve(_path).replace(/\\/g, '/');
    if (pathName.length > 0 && pathName.charAt(0) !== '/') {
        pathName = '/' + pathName;
    }
    return encodeURI('file://' + pathName);
}

const models = {};

const savedModelsValues = {};

const unregisteredModels = {};
const unregisteredSavedModelsValues = {};
const unregisteredModelsViewStates = {};

const viewStates = {};

const amdLoader = require('monaco-editor/min/vs/loader');
const { ipcRenderer } = require('electron');
const amdRequire = amdLoader.require;

//workaround because we changed the editor.js path
var dirname = __dirname + "/../"
amdRequire.config({
    baseUrl: uriFromPath(path.join(dirname, './../node_modules/monaco-editor/min'))
});

let editor;

let currentFilePath;

const fileType = {
    'js': 'javascript',
    'py': 'python',
    'ts': 'typescript',
    'html': 'html',
    'css': 'css',
    'json': 'json'
};

async function initializeEditor() {
    // workaround monaco-css not understanding the environment
    self.module = undefined;

    amdRequire(['vs/editor/editor.main'], function () {

        editor = monaco.editor.create(document.getElementById('editor'), {
            value: '',
            theme: "vs-dark",
            model: null
        });

        const monokai = require('monaco-themes/themes/Monokai.json');
        monaco.editor.defineTheme('monokai', monokai);
        monaco.editor.setTheme('monokai');

        var myBinding = editor.addCommand(monaco.KeyMod.CtrlCmd + monaco.KeyCode.US_DOT, function () {
            module.exports.zoomInEditor();
        });

        var anotherBinding = editor.addCommand(monaco.KeyMod.CtrlCmd + monaco.KeyCode.US_COMMA, function () {
            module.exports.zoomOutEditor();
        });

        //track position of cursor
        editor.onDidChangeCursorPosition(function (event) {
            viewStates[currentFilePath] = editor.saveViewState();
            editor.revealPosition(editor.getPosition());
            $("#cursor-notifier").text(`Line ${event.position.lineNumber} Column ${event.position.column}`);
        });

        editor.onDidScrollChange(function (scroll) {
            viewStates[currentFilePath] = editor.saveViewState();
        });


        editor.onDidChangeModelContent(function (e) {
            if (Object.keys(savedModelsValues).includes(currentFilePath)) {
                if (savedModelsValues[currentFilePath] !== models[currentFilePath].getValue()) {
                    modelsEventEmitters.emitModelNeedsToBeSaved(currentFilePath);
                } else {
                    modelsEventEmitters.emitModelIsSaved(currentFilePath);
                }
            } else {
                if (unregisteredSavedModelsValues[currentFilePath] !== unregisteredModels[currentFilePath].getValue()) {
                    modelsEventEmitters.emitModelNeedsToBeSaved(currentFilePath, true);
                } else {
                    modelsEventEmitters.emitModelIsSaved(currentFilePath, true);
                }
            }
        });

        var r = new ResizeSensor($('#editor'), function () {
            var width = parseInt($("#editor").css("width"))
            var height = parseInt($("#editor").css("height"))
            editor.layout({
                width: width,
                height: height
            })
        });
    });
}

function openNewModel(modelName) {
    let extention = getFileType(modelName.split(path.sep).pop());
    let model = monaco.editor.createModel('', extention);
    unregisteredModels[modelName] = model;
    unregisteredSavedModelsValues[modelName] = '';
    editor.setModel(model);
    editor.getModel().updateOptions({ insertSpaces: true });
    currentFilePath = modelName;
    modelsEventEmitters.addModelEventEmitter(modelName, true);

}

// increases text size of editor
zoomInEditor = function () {
    if (editor) {
        editor.updateOptions({
            fontSize: editor.getOptions()._values[36] + 2
        });
    }
}

// decreases text size of editor
zoomOutEditor = function () {
    if (editor) {
        editor.updateOptions({
            fontSize: editor.getOptions()._values[36] - 2
        });
    }
}

// opens a document with file path = filePath
openDoc = function (doc, filePath) {
    let type = getFileType(filePath);
    let model = monaco.editor.createModel(doc, type);
    models[filePath] = model;
    savedModelsValues[filePath] = model.getValue();
    editor.setModel(model);
    editor.getModel().updateOptions({ insertSpaces: true });
    currentFilePath = filePath;

    modelsEventEmitters.addModelEventEmitter(filePath);
}

// sets the current model to models[filePath] if available
setModelWithId = function (filePath) {
    if (!editor || !editor.getModel()) {
        return;
    }
    currentModel = editor.getModel();
    if (currentModel == models[filePath] || currentModel == unregisteredModels[filePath]) {
        return;
    }
    if (Object.keys(models).includes(filePath)) {
        editor.setModel(models[filePath]);
    } else if (Object.keys(unregisteredModels).includes(filePath)) {
        editor.setModel(unregisteredModels[filePath]);
    } else {
        return;
    }
    editor.getModel().updateOptions({ insertSpaces: true });
    currentFilePath = filePath;
}

// returns true if the model is in the currently opened models
// and false otherwise
modelIsAlreadyOpen = function (filePath) {
    for (var key in models) {
        if (key == filePath) {
            return true;
        }
    }
    return false;
}

// saves the cursor position 
retrieveViewState = function (filePath) {
    if (Object.keys(viewStates).includes(filePath)) {
        editor.restoreViewState(
            viewStates[filePath]
        );
    } else if (Object.keys(unregisteredModelsViewStates).includes(filePath)) {
        editor.restoreViewState(
            unregisteredModelsViewStates[filePath]
        );
    } else {
        return;
    }
    editor.focus();
}

getContentInRange = function (filePath, startLine, startColumn, endLine, endColumn) {
    try {
        let range = new monaco.Range(startLine, startColumn, endLine, endColumn);
        if (Object.keys(models).includes(filePath)) {
            return models[filePath].getValueInRange(range);
        } else if (Object.keys(unregisteredModels).includes(filePath)) {
            return unregisteredModels[filePath].getValueInRange(range);
        }
    } catch (e) {
        console.log(e);
    }
}

getPreviousLines = function () {
    try {
        let currentPosition = editor.getPosition();
        let line = currentPosition.lineNumber;
        currentLineLength = module.exports.getCurrentLine().length + 1;
        return module.exports.getContentInRange(currentFilePath, 1, 1, line, currentLineLength).split('\n');
    } catch(e) {
        return null;
    }
}

// inserts text at the current position of the cursor
// if position argument is not specified.
insertText = function (text, position) {

    if (!editor || !editor.getModel() || text === '' || text === undefined || text === null) {
        return;
    }

    if (position) {
        editor.setPosition(
            position
        );
    }

    var currentPosition = editor.getPosition();

    // op can also take an id
    op = {
        identifier: 'id',
        text: text,
        range: new monaco.Range(currentPosition.lineNumber,
            currentPosition.column,
            currentPosition.lineNumber,
            currentPosition.column),
        forceMoveMarkers: true
    }

    // executeEdits can take an id to track edits
    editor.executeEdits(
        "what", [op]
    );
}

// move cursor horizontally with the value specified
moveCursorHorizontally = function (value) {
    if (editor && editor.getModel()) {
        position = editor.getPosition();
        position.column += value;
        editor.setPosition(position);
    }
}

// returns the line at the current cursor position
// in the current opened model
getCurrentLine = function () {
    if (editor && editor.getModel()) {
        return editor.getModel().getLineContent(editor.getPosition().lineNumber);
    }
}

// sets the editor model and rerieves the 
// model's cursor position
focusModel = function (filePath) {
    if (editor) {
        module.exports.setModelWithId(filePath);
        module.exports.retrieveViewState(filePath);
    }
}

// returns file type according to its extention
function getFileType(filePath) {
    var type = filePath.split('.').pop();
    if (Object.keys(fileType).includes(type)) {
        return fileType[type];
    }
    return null;
}

// returns current cursor position
getCursorPosition = function () {
    if (editor && editor.getModel()) {
        return editor.getPosition();
    }
}

// sets the cursor to the position specified
setCursorPosition = function (position) {
    if (editor && editor.getModel()) {
        editor.setPosition(position);
    }
}

// updates cursor position by adding values to rows and columns respectively
function updateCursorPosition(rows, columns) {
    if(editor && editor.getModel()) {
        position = editor.getPosition();
        if(rows == 0 && columns == 0) {
            return;
        }
        position.lineNumber += rows;
        position.column += columns;
        editor.setPosition(position);
    }
}

// saves the current focused model
saveFile = function () {
    if (!editor || !currentFilePath) {
        return;
    }
    if (Object.keys(unregisteredSavedModelsValues).includes(currentFilePath)) {
        isRegistered = module.exports.modelIsRegistered(currentFilePath);
        filePath = currentFilePath;
        ipcRenderer.send('open-save-dialog', { filePath, isRegistered });
    } else {
        fs.writeFileSync(currentFilePath, editor.getValue(), { encoding: 'utf-8' });
        savedModelsValues[currentFilePath] = editor.getValue();
        modelsEventEmitters.emitModelIsSaved(currentFilePath);
    }
}

// returns true if the model is registered and false otherwise
modelIsRegistered = function (filePath) {
    if (Object.keys(models).includes(filePath)) {
        return true;
    } else if (Object.keys(unregisteredModels).includes(filePath)) {
        return false;
    } else {
        return undefined;
    }
}

// moves the file from unregistered file to registered file
// and updates the model langauge type
registerModel = function (oldName, filePath) {
    if (Object.keys(unregisteredModels).includes(oldName) && editor) {

        var model = unregisteredModels[oldName];
        var modelViewState = unregisteredModelsViewStates[oldName];
        var modelValue = unregisteredSavedModelsValues[oldName];

        delete unregisteredModels[oldName];
        delete unregisteredModelsViewStates[oldName];
        delete unregisteredSavedModelsValues[oldName];

        models[filePath] = model;
        savedModelsValues[filePath] = modelValue;
        if (modelViewState) {
            viewStates[filePath] = modelViewState;
        }

        var fileName = filePath.split(path.sep).pop();
        var type = fileName.split('.').pop();
        monaco.editor.setModelLanguage(model, fileType[type]);

        modelsEventEmitters.emitModelIsSaved(oldName, true);

        if (currentFilePath == oldName) {
            currentFilePath = filePath;
        }
    }
}

// effectively closes the tab with ID = filePath
// and shows other opened tabs if available.
removeModelWithId = function (filePath) {
    if (models.hasOwnProperty(filePath)) {
        delete models[filePath];
        delete savedModelsValues[filePath];
        delete viewStates[filePath];
    } else if (unregisteredModels.hasOwnProperty(filePath)) {
        delete unregisteredModels[filePath];
        delete unregisteredSavedModelsValues[filePath];
        delete unregisteredModelsViewStates[filePath];
    } else {
        return;
    }
    var keys = Object.keys(models);
    var unregisteredKeys = Object.keys(unregisteredModels);
    var totalKeys = keys.concat(unregisteredKeys);
    if (totalKeys.length == 0) {
        editor.setModel(null);
        return null;
    }
    var nextModel = totalKeys[(totalKeys.indexOf(currentFilePath) + 1) % totalKeys.length];
    return nextModel;
}

getModelContent = function (filePath) {
    if (editor) {
        if (Object.keys(models).includes(filePath)) {
            return models[filePath].getValue();
        } else if (Object.keys(unregisteredModels).includes(filePath)) {
            return unregisteredModels[filePath].getValue();
        } else {
            return null;
        }
    }
}


// returns the current model ID (the file path)
getCurrentModel = function () {
    var modelsKeys = Object.keys(models);
    var unregisteredModelsKeys = Object.keys(unregisteredModels);
    if (modelsKeys.length === 0 && unregisteredModelsKeys.length === 0) {
        return null;
    }

    return currentFilePath;
}

gotoColumn = function (columnNumber) {
    if (!editor || !editor.getModel()) {
        return;
    }
    position = editor.getPosition();
    position.column = columnNumber;
    editor.setPosition(position);
    editor.focus();
}

gotoLine = function (lineNumber) {
    if (!editor || !editor.getModel()) {
        return;
    }
    position = editor.getPosition();
    position.lineNumber = lineNumber;
    editor.setPosition(position);
    editor.focus();
}

// closes the current tab
closeCurrentTab = function () {
    module.exports.removeModelWithId(currentFilePath);
}

// selects all text
backSpace = function () {

    if (!editor || !editor.getModel()) {
        return;
    }

    currentCursorPosition = editor.getPosition();


    let selection = editor.getSelection();
    if (selection.startLineNumber !== selection.endLineNumber || selection.startColumn !== selection.endColumn) {
        op = {
            identifier: 'id',
            text: '',
            range: new monaco.Range(selection.startLineNumber,
                selection.startColumn,
                selection.endLineNumber,
                selection.endColumn)
        }
        // executeEdits can take an id to track edits
        editor.executeEdits(
            "what", [op]
        );

    } else {
        if (currentCursorPosition.lineNumber == 1 && currentCursorPosition.column == 1) {
            return;
        }

        if (currentCursorPosition.column == 1) {
            prevLineLength = editor.getModel().getLineContent(editor.getPosition().lineNumber - 1).length;
            editor.executeEdits(
                'what', [
                {
                    identifier: 'id',
                    text: '',
                    range: new monaco.Range(
                        currentCursorPosition.lineNumber - 1,
                        prevLineLength + 1,
                        currentCursorPosition.lineNumber,
                        1
                    )
                }
            ]
            );
        } else {
            removeLeftCharacter(currentCursorPosition);
        }
    }
}

function removeLeftCharacter(position) {
    op = {
        identifier: 'id',
        text: '',
        range: new monaco.Range(position.lineNumber,
            position.column - 1,
            position.lineNumber,
            position.column)
    }
    // executeEdits can take an id to track edits
    editor.executeEdits(
        "what", [op]
    );
}

selectAllText = function () {
    editor.setSelection(models[currentFilePath].getFullModelRange());
}

// scrolls to the cursor position
revealCursor = function () {
    if (!editor || !editor.getModel()) {
        return;
    }

    editor.revealPosition(editor.getPosition());
}

// undo
undo = function () {
    if (!editor || !editor.getModel()) {
        return;
    }
    editor.getModel().undo();
}

// redo
redo = function () {
    if (!editor || !editor.getModel()) {
        return;
    }
    editor.getModel().redo();
}

commentLine = function () {
    if (!editor || !editor.getModel()) {
        return;
    }
    editor.trigger('source', 'editor.action.commentLine');
}

deleteLine = function () {
    if (!editor || !editor.getModel()) {
        return;
    }
    editor.trigger('source', 'editor.action.deleteLines');
}

deleteLeft = function () {
    if (!editor || !editor.getModel()) {
        return;
    }
    editor.trigger('soruce', 'deleteAllLeft');
}

deleteRight = function () {
    if (!editor || !editor.getModel()) {
        return;
    }

    editor.trigger('soruce', 'deleteAllRight');
}

copy = function () {
    if (!editor || !editor.getModel()) {
        return;
    }
    editor.trigger('source', 'editor.action.clipboardCopyAction');
}

cut = function () {
    if (!editor || !editor.getModel()) {
        return;
    }
    editor.trigger('source', 'editor.action.clipboardCutAction');
}

paste = function () {
    if (!editor || !editor.getModel()) {
        return;
    }
    editor.trigger('source', 'editor.action.clipboardPasteAction');
}

selectRange = function (startLine, startColumn, endLine, endColumn) {
    try {
        let range = new monaco.Range(startLine, startColumn, endLine, endColumn);
        editor.setSelection(range);
    } catch (e) {
        console.log(e);
    }
}

selectLine = function () {
    if(editor && editor.getModel()) {
        let currentLineLength = module.exports.getCurrentLine().length;
        let position = editor.getPosition();
        let range = new monaco.Range(position.lineNumber, 1, position.lineNumber, currentLineLength + 1);
        editor.setSelection(range);
    }
}

// selects the current column till + the passed number
selectLeft = function (numColumns) {
    try {
        numColumns = parseInt(numColumns);
        let position = editor.getPosition();
        let endColumn = Math.max(1, position.column - numColumns);
        let range = new monaco.Range(position.lineNumber, position.column, position.lineNumber, endColumn);
        editor.setSelection(range);
    } catch (e) {
        console.log(e);
    }
}

selectRight = function (numColumns) {
    try {
        numColumns = parseFloat(numColumns);
        let position = editor.getPosition();
        let currentLineLength = module.exports.getCurrentLine().length;
        let endColumn = Math.min(position.column + numColumns, currentLineLength + 1);
        let range = new monaco.Range(position.lineNumber, position.column, position.lineNumber, endColumn);
        editor.setSelection(range);
    } catch (e) {
        console.log(e);
    }
}

selectUp = function (numRows) {
    try {
        numRows = parseInt(numRows);
        let position = editor.getPosition();
        let currentLineLength = editor.getModel().getLineContent(position.lineNumber).length;
        let endRow = Math.max(position.lineNumber - (numRows - 1), 1);
        let range = new monaco.Range(position.lineNumber, currentLineLength + 1, endRow, 1);
        editor.setSelection(range);
    } catch (e) {
        console.log(e);
    }
}

selectDown = function (numRows) {
    try {
        numRows = parseInt(numRows);
        let position = editor.getPosition();
        let fullModelRange = editor.getModel().getFullModelRange();
        let endRow = Math.min(fullModelRange.endLineNumber, position.lineNumber + numRows - 1);
        let targetLineLength = editor.getModel().getLineContent(endRow).length + 1;
        let range = new monaco.Range(position.lineNumber, 1, endRow, targetLineLength);
        editor.setSelection(range);
    } catch (e) {
        console.log(e);
    }
}

// opens the next tab if available 
// from the currently opened tabs
openNextTab = function () {
    var keys = Object.keys(models);

    if (keys.length > 1) {
        index = (keys.indexOf(currentFilePath) + 1) % keys.length;
        module.exports.focusModel(keys[index]);
    }
}

unregisteredModelExists = function (modelName) {
    if (Object.keys(unregisteredModels).includes(modelName)) {
        return true;
    }
    return false;
}

module.exports = {
    openDoc,
    setModelWithId,
    modelIsAlreadyOpen,
    retrieveViewState,
    insertText,
    focusModel,
    getCursorPosition,
    setCursorPosition,
    saveFile,
    getCurrentLine,
    removeModelWithId,
    moveCursorHorizontally,
    getCurrentModel,
    zoomInEditor,
    zoomOutEditor,
    closeCurrentTab,
    openNextTab,
    backSpace,
    undo,
    redo,
    commentLine,
    deleteLine,
    copy,
    cut,
    paste,
    gotoLine,
    gotoColumn,
    selectAllText,
    openNewModel,
    getModelContent,
    registerModel,
    modelIsRegistered,
    unregisteredModelExists,
    getContentInRange,
    getPreviousLines,
    selectLine,
    selectRange,
    selectLeft,
    selectRight,
    selectUp,
    selectDown,
    revealCursor,
    deleteLeft,
    deleteRight,
    initializeEditor,
    updateCursorPosition
}