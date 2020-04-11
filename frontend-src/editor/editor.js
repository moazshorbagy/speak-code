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

const cursorPositions = {};

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
        monaco.editor.defineTheme('monokai', monokai);
        monaco.editor.setTheme('monokai')
        let currentWindow = remote.getCurrentWindow();
        currentWindow.on('resize', function () {
            editor.layout();
        });

        currentFilePath = filePath;

        //track position of cursor
        editor.onDidChangeCursorPosition(function(position) {
            cursorPositions[currentFilePath] = position.position;
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

openDoc = function (doc, filePath) {
    type = getFileType(filePath);
    if (!editor) {
        initEditor(doc, filePath, type);
    } else {
        var model = monaco.editor.createModel(doc, type);
        models[filePath] = model;
        editor.setModel(model);
        currentFilePath = filePath;
        getFileType(filePath);
    }
}

// generally, fileId is the filePath
setModelWithId = function (fileId) {
    if (editor.getModel() == models[fileId]) {
        return;
    }
    editor.setModel(models[fileId]);
    currentFilePath = fileId;
}

modelIsAlreadyOpen = function (filePath) {
    for (var key in models) {
        if (key == filePath) {
            return true;
        }
    }
    return false;
}

retrieveCursorPosition = function(filePath) {
    if(!(filePath in cursorPositions)) {
        return;
    }
    editor.setPosition(
        cursorPositions[filePath]
    );
    editor.focus();
}

insertText = function(text, position) {

    if(!editor) {
        return;
    }

    if(position) {
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

}

focusModel = function(filePath) {
    module.exports.setModelWithId(filePath);
    module.exports.retrieveCursorPosition(filePath);
}

function getFileType(filePath) {
    var type = filePath.split('.').pop();
    return fileType[type];
}

getCursorPosition = function() {
    return editor.getPosition();
}

setCursorPosition = function(position) {
    editor.setPosition(position);
}

saveFile = function() {
    fs.writeFileSync(currentFilePath, editor.getValue(), { encoding: 'utf-8' });
}

module.exports = {
    openDoc,
    setModelWithId,
    modelIsAlreadyOpen,
    retrieveCursorPosition,
    insertText,
    focusModel,
    getCursorPosition,
    setCursorPosition,
    saveFile
}