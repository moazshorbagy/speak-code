
var openEditorsId = 'open-editors';

var openEditorsClass = 'leftpanel preventSelect fileNameSpan';

var openEditorsContentContainerId = 'open-editors-content-container';

var openEditorsContentContainerClass = 'open-editors-content';

const Path = require('path');

const editor = require('../editor/editor');

const modelsEventEmitters = require('../editor/model-did-change-event');
const { ipcRenderer } = require('electron');
// a boolean array, if entry = true, then index
// is an available id to opened tab
let tabIdOptimizer = [];

// same as tabIdOptimizer but for naming newly opened tabs,
// that are not saved on the computer.
unregisteredTabNumberOptimizer = [];

let unregisteredTabIdMap = {};

let tabIdMap = {};

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

function getLeastAvailableId(tabIdArray) {
    for (var i = 0; i < tabIdArray.length; i++) {
        if (tabIdArray[i] === true) {
            tabIdArray[i] = false;
            return i;
        }
    }

    tabIdArray.push(false);
    return tabIdArray.length - 1;
}


addOpenedFile = function (filePath, isUnregistered) {
    module.exports.addOpenEditors();

    var openEditorsContentContainer = $("#" + openEditorsContentContainerId);
    var fileName = filePath;
    if (isUnregistered !== true) {
        fileName = filePath.split(Path.sep).pop();
    }

    var children = openEditorsContentContainer.children();
    for (let i = 0; i < children.length; i++) {
        if (children[i].id == filePath) {
            return;
        }
    }

    module.exports.displayCurrentlyOpenedFileName(filePath);

    var tabNumber = getLeastAvailableId(tabIdOptimizer);

    if (isUnregistered) {
        unregisteredModelsDidChangeEvents = modelsEventEmitters.getUnregisteredModelsEventEmitters();
        unregisteredModelsDidChangeEvents[filePath].on('needs-save-as', (filePath) => {
            module.exports.notifyNeedsSave(filePath);
        });

        unregisteredModelsDidChangeEvents[filePath].on('saved-as', (filePath) => {
            module.exports.notifyIsSaved(filePath);
        });
        unregisteredTabIdMap[tabNumber] = filePath;
    } else {

        modelsDidChangedEvents = modelsEventEmitters.getModelsEventEmitters();
        modelsDidChangedEvents[filePath].on('needs-save', (filePath) => {
            module.exports.notifyNeedsSave(filePath);
        });

        modelsDidChangedEvents[filePath].on('saved', (filePath) => {
            module.exports.notifyIsSaved(filePath);
        });
        tabIdMap[tabNumber] = filePath;
    }

    var tabId = filePath + "_t";

    var closeTabIcon = "<img id='" + tabId + "' src='icons/close-24px.svg' class='float-left'> </img>";

    var tabNumberIdDiv = `<div class='float-left' style='padding: 0 5px;'> ${tabNumber} </div>`;

    openEditorsContentContainer.append("<div id='OFcontainer_" + filePath +
        "' class='fileNameSpan'> <div id='OFDescriptor_" + filePath + "' class='folder-descriptor'>" + tabNumberIdDiv +
        closeTabIcon + "<p id='" + filePath + "' class='float-left'>" + fileName + " </p> </div> </div>");

    document.getElementById(filePath).addEventListener('click', function () {
        module.exports.displayCurrentlyOpenedFileName(this.id);
        editor.focusModel(this.id);
    });

    document.getElementById(tabId).addEventListener('click', function () {
        var filePath = this.id.split('_');
        filePath.pop();
        filePath = filePath.join('_')
        module.exports.closeTab(filePath, false);
    });
}

notifyIsSaved = function (filePath) {
    document.getElementById(filePath + '_t').src = 'icons/close-24px.svg';
}

notifyNeedsSave = function (filePath) {
    document.getElementById(filePath + '_t').src = 'icons/modified.svg';
}

displayCurrentlyOpenedFileName = function (filePath) {
    var currentlyOpenedFile = $("#editor-top-panel").empty();
    if (!filePath) {
        return;
    }
    currentlyOpenedFile.append(`${filePath.split(Path.sep).pop()}`);
}

gotoTab = function (tabNumber) {
    var ids = Object.keys(tabIdMap);
    if (ids.includes(tabNumber)) {
        tabId = tabIdMap[tabNumber];
        editor.focusModel(tabId);
        module.exports.displayCurrentlyOpenedFileName(tabId);
    }
}

openNewFile = function () {
    try {
        modelName = 'Untitled_' + getLeastAvailableId(unregisteredTabNumberOptimizer);
        editor.openNewModel(modelName);
        module.exports.addOpenedFile(modelName, true);
    } catch (e) {
        console.log(e);
    }
}

// closes the tab with ID: filePath
closeTab = function (filePath, forceClose) {
    var unsavedUnregisteredModels = modelsEventEmitters.getUnsavedUnregisteredModels();
    if(unsavedUnregisteredModels.includes(filePath)) {
        console.log(filePath);
        ipcRenderer.send('open-save-dialog', filePath);
    }
    var unsavedModels = modelsEventEmitters.getUnsavedModels();
    if (unsavedModels.includes(filePath) && forceClose === false) {
        ipcRenderer.send('open-file-save-check-message-box', filePath);
    } else {
        var tabNumber = document.getElementById('OFDescriptor_' + filePath).children[0].innerHTML;
        tabIdOptimizer[parseInt(tabNumber)] = true;
        delete tabIdMap[filePath];

        var tab = document.getElementById('OFcontainer_' + filePath);

        if (tab) {
            tab.parentNode.removeChild(tab);
            var nextTab = editor.removeModelWithId(filePath);
            if (editor.getCurrentModel() == filePath) {
                editor.focusModel(nextTab);
                module.exports.displayCurrentlyOpenedFileName(nextTab);
            }
        }
    }
}

module.exports = {
    addOpenEditors,
    addOpenedFile,
    notifyIsSaved,
    notifyNeedsSave,
    displayCurrentlyOpenedFileName,
    closeTab,
    gotoTab,
    openNewFile
}