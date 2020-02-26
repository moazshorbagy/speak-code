let editor = null;

let fileCount = 1;

let sessions = [];

let currPath = __dirname;

const fs = require('fs');
let exploredFilesContainer = $(".exploredFilesContainer");
let files = fs.readdirSync(currPath, { withFileTypes: true });

let folders = files.filter(entry => !entry.isFile());
for (let i = 0; i < folders.length; i++) {
    let _class = 'fileNameSpan';
    exploredFilesContainer.append("<div id='" + folders[i].name + "' class='" + _class + "'> > " + folders[i].name + "</div> ");
}

files = files.filter(entry => entry.isFile())
for (let i = 0; i < files.length; i++) {
    let _class = 'fileNameSpan';
    exploredFilesContainer.append("<div id='" + files[i].name + "' class='" + _class + "'>" + files[i].name + "</div> ");
    document.getElementById(files[i].name).addEventListener('click', function () {
        createNewFile(files[i].name);
    }, false);
}

function createNewFile(fileName) {
    if (fileName && sessions[fileName]) {
        editor.setSession(sessions[fileName]);
        return;
    }

    let isNew = false
    if (!fileName) {
        isNew = true
        fileName = `Untitled-${fileCount++}.py`;
    }

    //responsible for appending a new list item in filesContainer
    addNewExplorerTabInFilesConitainer(fileName);

    //responsible for opening a coding screen
    openCodeSlate(fileName, isNew);

}

function addNewExplorerTabInFilesConitainer(fileName) {

    $(".filesContainer").append("<li id='" + fileName + "'> <span class='closeTabIcon'>x</span> <div class='fileNameSpan'>" + fileName + "</div> </li> ");

    addClickHandler(fileName);
}

function addClickHandler(id) {
    document.getElementById(id).addEventListener('click', function () {
        console.log(id)
        editor.setSession(sessions[id]);
    }, false);
}

function openCodeSlate(fileName, isNew) {
    if (!sessions.length) {
        const editorId = 'editorId';

        let editorStyles = "position:relative;" +
            "top:0; right:0; bottom:90; left:0;" +
            "font-size:12pt; font-weight:normal; white-space:nowrap; display:block; z-index:999";

        let editorDesign = "<div class='codeslate' id='" + editorId + "' style='" + editorStyles + "'></div>";

        $(".editorContainer").append(editorDesign);
        editor = ace.edit(editorId);
    }

    sessions[fileName] = ace.createEditSession('', 'ace/mode/python');
    editor.setTheme("ace/theme/twilight");
    editor.session.setMode("ace/mode/python");
    editor.setSession(sessions[fileName]);

    if (!isNew) {
        sessions[fileName].setValue(fs.readFileSync(`${currPath}/${fileName}`, { encoding: 'utf-8' }));
    }
}