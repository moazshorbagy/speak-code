let editor = null;

let untitledCount = 1;

let sessions = []

function createNewFile() {

    //responsible for appending a new list item in filesContainer
    addNewExplorerTabInFilesConitainer();

    //responsible for opening a coding screen
    openCodeSlate();

}

function addNewExplorerTabInFilesConitainer() {

    let fileName = "Untitled - " + untitledCount++;
    let sessionId = `session_${sessions.length}`

    $(".filesContainer").append("<li id='" + sessionId + "'> <span class='closeTabIcon'>x</span> <div class='fileNameSpan'>" + fileName + "</div> </li> ");

    let file = document.getElementById(sessionId);
    addClickHandler(file, sessionId)
}

function addClickHandler(elem, sessionId) {
    elem.addEventListener('click', function () {
        console.log(parseInt(sessionId.split('_')[1]))
        editor.setSession(sessions[parseInt(sessionId.split('_')[1])]);
    }, false);
}

function openCodeSlate() {
    if (!sessions.length) {
        const editorId = 'editorId';

        let editorStyles = "position:relative;" +
            "top:0; right:0; bottom:90; left:0;" +
            "font-size:12pt; font-weight:normal; white-space:nowrap; display:block; z-index:999";

        let editorDesign = "<div class='codeslate' id='" + editorId + "' style='" + editorStyles + "'></div>";

        $(".editorContainer").append(editorDesign);
        editor = ace.edit(editorId);
    }

    sessions.push(ace.createEditSession('', 'ace/mode/python'));
    editor.setTheme("ace/theme/twilight");
    editor.session.setMode("ace/mode/python");
}