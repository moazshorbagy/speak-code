
var fileTabCount = 0;
var openedTabs = 0;
var untitledCount = 1;

var editorId = '123';

var opened = false;

var editor = null;

let sessions = []


function createNewFile() {

    untitledCount++;
    openedTabs++;

    editorId = "codeslate_" + fileTabCount;

    //responsible for appending a new list item in filesContainer
    addNewExplorerTabInFilesConitainer(editorId);

    //responsible for opening a coding screen
    openCodeSlate();

}

function addClickHandler(elem, editorId) {
    elem.addEventListener('click', function () {
        editor.setSession(parseInt(sessions[editorId[editorId.length - 1]]));
    }, false);
}

function addNewExplorerTabInFilesConitainer(editorId) {

    var fileName = "Untitled - " + untitledCount;

    $(".filesContainer").append("<li id='" + '$' + editorId + "'> <span class='closeTabIcon'>x</span> <div class='fileNameSpan'>" + fileName + "</div> </li> ");
    var file = document.getElementById('$' + editorId);
    addClickHandler(file, editorId)

    // console.log(file);
}

function openCodeSlate() {
    if (!opened) {
        var editorStyles = "position:relative;" +
            "top:0; right:0; bottom:90; left:0;" +
            "font-size:12pt; font-weight:normal; white-space:nowrap; display:block; z-index:999";

        var editorDesign = "<div class='codeslate' id='" + editorId + "' style='" + editorStyles + "'></div>";

        $(".editorContainer").append(editorDesign);
        editor = ace.edit(editorId);
        opened = true;
    }

    sessions.push(ace.createEditSession('', 'ace/mode/python'));
    editor.setTheme("ace/theme/twilight");
    editor.session.setMode("ace/mode/python");
}