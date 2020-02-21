
var fileTabCount = 0;
var openedTabs = 0;
var untitledCount = 0;

var editorId;

let sessions = []


function createNewFile() {

    fileTabCount++;
    untitledCount++;
    openedTabs++;

    editorId = "codeslate_" + fileTabCount;

    //responsible for appending a new list item in filesContainer
    addNewExplorerTabInFilesConitainer(editorId);

    //responsible for opening a coding screen
    openCodeSlate(editorId);

}

function addClickHandler(elem, editorId) {
    elem.addEventListener('click', function() {
        var editor = ace.edit(editorId);
        editor.setSession(sessions[editorId[editorId.length - 1]]);
        console.log(editorId[editorId.length - 1]);
    }, false);
}

function addNewExplorerTabInFilesConitainer(editorId) {

    var fileName = "Untitled - " + untitledCount;

    $(".filesContainer").append("<li id='" + '$' + editorId + "'> <span class='closeTabIcon'>x</span> <div class='fileNameSpan'>" + fileName + "</div> </li> ");
    var file = document.getElementById('$' + editorId);
    addClickHandler(file, editorId)

    // console.log(file);
}

function openCodeSlate(editorId) {

    var editorStyles = "position:relative;" +
        "top:0; right:0; bottom:90; left:0;" +
        "font-size:12pt; font-weight:normal; white-space:nowrap; display:block; z-index:999";

    var editorDesign = "<div class='codeslate' id='" + editorId + "' style='" + editorStyles + "'></div>";

    $(".editorContainer").append(editorDesign);

    var editor = ace.edit(editorId);
    sessions.push(ace.createEditSession('', 'ace/mode/python'));
    editor.setTheme("ace/theme/twilight");
    editor.session.setMode("ace/mode/python");
}