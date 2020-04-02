const path = require('path');

function uriFromPath(_path) {
    var pathName = path.resolve(_path).replace(/\\/g, '/');
    if (pathName.length > 0 && pathName.charAt(0) !== '/') {
        pathName = '/' + pathName;
    }
    return encodeURI('file://' + pathName);
}

const models = {};

const amdLoader = require('monaco-editor/min/vs/loader');
const amdRequire = amdLoader.require;

//workaround because we changed the editor.js path
var dirname = __dirname + "/../"
amdRequire.config({
    baseUrl: uriFromPath(path.join(dirname, './node_modules/monaco-editor/min'))
});

let editor;

const fileType = {
    'js': 'javascript',
     'py':  'python',
     'ts':  'typescript',
     'html': 'html',
     'css':  'css',
     'json': 'json'
};

initEditor = function(doc, filePath, type) {

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

openDoc = function(doc, filePath) {
    type = getFileType(filePath);
    if (!editor) {
        initEditor(doc, filePath, type);
    } else {  
        var model = monaco.editor.createModel(doc, type);
        models[filePath] = model;
        editor.setModel(model);
        getFileType(filePath);
    }
}

// generally, fileId is the filePath
setModelWithId = function(fileId) {
    if(editor.getModel() == models[fileId]) {
        console.log('gotcha');
        return;
    }
    editor.setModel(models[fileId]);
}

function getFileType(filePath) {
    var type = filePath.split('.').pop();
    return fileType[type];
}

module.exports = {
    openDoc,
    setModelWithId
}