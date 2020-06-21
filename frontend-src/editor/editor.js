const path = require('path');
const fs = require('fs');
const modelsEventEmitters = require('./model-did-change-event');

function uriFromPath(_path) {
    var pathName = path.resolve(_path).replace(/\\/g, '/');
    if (pathName.length > 0 && pathName.charAt(0) !== '/') {
        pathName = '/' + pathName;
    }
    return encodeURI('file://' + pathName);
}

const models = {};

const savedModelsValues = {};

const viewStates = {};

const amdLoader = require('monaco-editor/min/vs/loader');
const amdRequire = amdLoader.require;

//workaround because we changed the editor.js path
var dirname = __dirname + "/../"
amdRequire.config({
    baseUrl: uriFromPath(path.join(dirname, './node_modules/monaco-editor/min'))
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


// initializes a monaco editor instance (which is the only one).
// and binds 
initEditor = function (doc, filePath, type) {

    // workaround monaco-css not understanding the environment
    self.module = undefined;

    amdRequire(['vs/editor/editor.main'], function () {

        const remote = require('electron').remote;
        editor = monaco.editor.create(document.getElementById('editor'), {
            value: '',
            language: type,
            theme: "vs-dark",
        });
        const monokai = require('monaco-themes/themes/Monokai.json');
        var model = monaco.editor.createModel(doc, type);
        editor.setModel(model);
        models[filePath] = model;
        savedModelsValues[filePath] = model.getValue();
        monaco.editor.defineTheme('monokai', monokai);
        monaco.editor.setTheme('monokai')
        let currentWindow = remote.getCurrentWindow();
        currentWindow.on('resize', function () {
            editor.layout();
        });

        editor.getModel().updateOptions({ insertSpaces: true });

        currentFilePath = filePath;

        var myBinding = editor.addCommand(monaco.KeyMod.CtrlCmd + monaco.KeyCode.US_DOT, function () {
            module.exports.zoomInEditor();
        });

        var anotherBinding = editor.addCommand(monaco.KeyMod.CtrlCmd + monaco.KeyCode.US_COMMA, function () {
            module.exports.zoomOutEditor();
        });

        //track position of cursor
        editor.onDidChangeCursorPosition(function (position) {
            viewStates[currentFilePath] = editor.saveViewState();
            editor.revealPosition(editor.getPosition());
        });

        editor.onDidScrollChange(function(scroll) {
            viewStates[currentFilePath] = editor.saveViewState();
        })


        editor.onDidChangeModelContent(function (e) {
            console.log(e);
            if (savedModelsValues[currentFilePath] !== models[currentFilePath].getValue()) {
                modelsEventEmitters.emitModelNeedsToBeSaved(currentFilePath);
            } else {
                emitModelIsSaved(currentFilePath);
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

// increases text size of editor
zoomInEditor = function () {
    editor.updateOptions({
        fontSize: editor.getOptions()._values[36] + 2
    });
}

// decreases text size of editor
zoomOutEditor = function () {
    editor.updateOptions({
        fontSize: editor.getOptions()._values[36] - 2
    });
}

// opens a document with file path = filePath
openDoc = function (doc, filePath) {
    type = getFileType(filePath);
    if (!editor) {
        initEditor(doc, filePath, type);
    } else {
        var model = monaco.editor.createModel(doc, type);
        models[filePath] = model;
        savedModelsValues[filePath] = model.getValue();
        editor.setModel(model);
        editor.getModel().updateOptions({ insertSpaces: true });
        currentFilePath = filePath;
        getFileType(filePath);
    }
    modelsEventEmitters.addModelEventEmitter(filePath);
}

select = function() {

}

// sets the current model to models[filePath] if available
setModelWithId = function (filePath) {
    if (editor.getModel() == models[filePath]) {
        return;
    }
    editor.setModel(models[filePath]);
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
    if (!(filePath in viewStates)) {
        return;
    }
    editor.restoreViewState(
        viewStates[filePath]
    );
    editor.focus();
}

// inserts text at the current position of the cursor
// if position argument is not specified.
insertText = function (text, position) {

    if (!editor || !editor.getModel()) {
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
            currentPosition.column)
    }

    // executeEdits can take an id to track edits
    editor.executeEdits(
        "what", [op]
    );

    editor.focus();

}

// move cursor horizontally with the value specified
moveCursorHorizontally = function (value) {
    position = editor.getPosition();
    position.column += value;
    editor.setPosition(position)
}

// returns the line at the current cursor position
// in the current opened model
getCurrentLine = function () {
    return editor.getModel().getLineContent(editor.getPosition().lineNumber);
}

// sets the editor model and rerieves the 
// model's cursor position
focusModel = function (filePath) {
    module.exports.setModelWithId(filePath);
    module.exports.retrieveViewState(filePath);
}

// returns file type according to its extention
function getFileType(filePath) {
    var type = filePath.split('.').pop();
    return fileType[type];
}

// returns current cursor position
getCursorPosition = function () {
    return editor.getPosition();
}

// sets the cursor to the position specified
setCursorPosition = function (position) {
    editor.setPosition(position);
}

// saves the current focused model
saveFile = function () {
    if (!editor || !currentFilePath) {
        return;
    }
    fs.writeFileSync(currentFilePath, editor.getValue(), { encoding: 'utf-8' });
    savedModelsValues[currentFilePath] = editor.getValue();
    modelsEventEmitters.emitModelIsSaved(currentFilePath);
}

// effectively closes the tab with ID = filePath
// and shows other opened tabs if available.
removeModelWithId = function (filePath) {
    if (models.hasOwnProperty(filePath)) {
        delete models[filePath];
        delete savedModelsValues[filePath];
        delete viewStates[filePath];
        var keys = Object.keys(models);
        if (keys.length == 0) {
            editor.setModel(null);
            return null;
        }
        var nextModel = keys[(keys.indexOf(currentFilePath) + 1) % keys.length];
        return nextModel;
    }
}

// returns the current model ID (the file path)
getCurrentModel = function () {
    var keys = Object.keys(models);
    if (keys.length == 0) {
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

selectAllText = function() {
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
    console.log(editor.getActions().map(a => a.id));
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
    console.log(editor.getActions().map(a => a.id));
}

deleteLine = function () {
    if (!editor || !editor.getModel()) {
        return;
    }
    editor.trigger('source', 'editor.action.deleteLines');
    console.log(editor.getActions().map(a => a.id));
}

copy = function () {
    if (!editor || !editor.getModel()) {
        return;
    }
    editor.trigger('source', 'editor.action.clipboardCopyAction');
    console.log(editor.getActions().map(a => a.id));
}

cut = function () {
    if (!editor || !editor.getModel()) {
        return;
    }
    editor.trigger('source', 'editor.action.clipboardCutAction');
    console.log(editor.getActions().map(a => a.id));
}

paste = function () {
    if (!editor || !editor.getModel()) {
        return;
    }
    editor.trigger('source', 'editor.action.clipboardPasteAction');
    console.log(editor.getActions().map(a => a.id));
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
    selectAllText
}