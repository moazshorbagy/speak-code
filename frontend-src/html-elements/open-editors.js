
var openEditorsId = 'open-editors';

var openEditorsClass = 'leftpanel preventSelect fileNameSpan';

var openEditorsContentContainerId = 'open-editors-content-container';

var openEditorsContentContainerClass = 'open-editors-content';

const Path = require('path');

const editor = require('../editor/editor');

const modelsEventEmitters = require('../editor/model-did-change-event');

// for new tabs 
tabsCount = 0;

let unsavedModels = [];

addOpenEditors = function () {

    var doesExist = $("#" + openEditorsId).length;
    if (doesExist) {
        return;
    }

    var openEditorsContainer = $('#open-editors-container');

    openEditorsContainer.css("margin-top", "30px");

    openEditorsContainer.css("border-bottom", "black 1px solid");

    openEditorsContainer.append("<div id='" + openEditorsId + "' class='" + openEditorsClass + "'> > Opened files </div>");

    openEditorsContainer.append("<div id='" + openEditorsContentContainerId + "' class='" + openEditorsContentContainerClass + "'> </div>");

    $("#" + openEditorsContentContainerId).css("display", "none");

    document.getElementById(openEditorsId).addEventListener('click', function () {
        var content = this.nextElementSibling;
        if (content.style.display === "block") {
            content.style.display = "none";
        } else {
            content.style.display = "block";
        }
    });
}


addOpenedFile = function (filePath) {
    var openEditorsContentContainer = $("#" + openEditorsContentContainerId);
    var fileName = filePath.split(Path.sep).pop();

    var children = openEditorsContentContainer.children();
    for (let i = 0; i < children.length; i++) {
        if (children[i].id == filePath) {
            return;
        }
    }

    module.exports.displayCurrentlyOpenedFileName(filePath);

    modelsDidChangedEvents = modelsEventEmitters.modelsEventEmitters;
    modelsDidChangedEvents[filePath].on('needs-save', (filePath) => {
        module.exports.notifyNeedsSave(filePath);
    });

    modelsDidChangedEvents[filePath].on('saved', (filePath) => {
        module.exports.notifyIsSaved(filePath);
    });

    var tabId = filePath + "_t";

    var closeTabIcon = "<img id='" + tabId + "' src='icons/close-24px.svg' class='float-left'> </img>";

    openEditorsContentContainer.append("<div id='OFcontainer_" + filePath + "' class='fileNameSpan'> <div class='folder-descriptor'>" + closeTabIcon + "<p id='" + filePath + "' class='float-left'>" + fileName + " </p> </div> </div>");

    document.getElementById(filePath).addEventListener('click', function () {
        module.exports.displayCurrentlyOpenedFileName(this.id);
        editor.focusModel(this.id);
    });

    document.getElementById(tabId).addEventListener('click', function () {
        var tab = this.id.split('_')[0];
        var element = document.getElementById('OFcontainer_' + tab);
        element.parentNode.removeChild(element);
        var nextTab = editor.removeModelWithId(tab);
        module.exports.displayCurrentlyOpenedFileName(nextTab);
    });
}

notifyIsSaved = function (filePath) {
    document.getElementById(filePath + '_t').src = 'icons/close-24px.svg';
    document.getElementById('savedState').innerText = 'saved';
    console.log(unsavedModels)
    console.log(filePath)
    unsavedModels = unsavedModels.filter(entry => entry !== filePath);
    console.log(unsavedModels);
}

notifyNeedsSave = function (filePath) {
    if(!unsavedModels.includes(filePath)) {
        unsavedModels.push(filePath);
    } 
    
    document.getElementById(filePath + '_t').src = 'icons/modified.svg';
    document.getElementById('savedState').innerText = 'unsaved';
}

displayCurrentlyOpenedFileName = function (filePath) {
    var currentlyOpenedFile = $("#editor-top-panel").empty();
    if (!filePath) {
        return;
    }

    currentlyOpenedFile.append(`<div id='fileName'>${filePath.split(Path.sep).pop()}</div>`);
    currentlyOpenedFile.append(`<div id='savedState'>${unsavedModels.includes(filePath) ? 'unsaved' : 'saved'}</div>`);
}

module.exports = {
    addOpenEditors,
    addOpenedFile,
    notifyIsSaved,
    notifyNeedsSave,
    displayCurrentlyOpenedFileName
}