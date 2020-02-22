let editor = null;

let fileCount = 1;

let sessions = []

function createNewFile() {
    let fileName = `Untitled-${fileCount}.py`;

    //responsible for appending a new list item in filesContainer
    addNewExplorerTabInFilesConitainer(fileName);

    //responsible for opening a coding screen
    openCodeSlate(fileName);

    fileCount++;
}

function addNewExplorerTabInFilesConitainer(fileName) {

    $(".filesContainer").append("<li id='" + fileName + "'> <span class='closeTabIcon'>x</span> <div class='fileNameSpan'>" + fileName + "</div> </li> ");

    addClickHandler(fileName)
}

function addClickHandler(id) {
    document.getElementById(id).addEventListener('click', function () {
        console.log(id)
        editor.setSession(sessions[id]);
    }, false);
}

function openCodeSlate(fileName) {
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
}