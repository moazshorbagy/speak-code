
var openEditorsId = 'open-editors';

var openEditorsClass = 'leftpanel preventSelect fileNameSpan';

var openEditorsContentContainerId = 'open-editors-content-container';

var openEditorsContentContainerClass = 'open-editors-content';

const Path = require('path');
// a boolean array, if entry = true, then index
// is an available id to opened tab
let tabIdOptimizer = [];

// same as tabIdOptimizer but for naming newly opened tabs,
// that are not saved on the computer.
unregisteredTabNumberOptimizer = [];

let unregisteredTabIdMap = {};

let tabIdMap = {};

let unregisteredTabs = [];

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

    handleModelDidChangeEvent(filePath, isUnregistered, tabNumber);

    var tabId = filePath + "_t";

    var closeTabIcon = "<img id='" + tabId + "' src='icons/close-24px.svg' class='float-left'> </img>";

    var tabNumberIdDiv = `<div class='float-left' style='padding: 0 5px;'> ${tabNumber} </div>`;

    openEditorsContentContainer.append("<div id='OFContainer_" + filePath +
        "' class='fileNameSpan'> <div id='OFDescriptor_" + filePath + "' class='folder-descriptor'>" + tabNumberIdDiv +
        closeTabIcon + "<p id='" + filePath + "' class='float-left'>" + fileName + " </p> </div> </div>");

    addOpenAndCloseEventListeners(filePath);
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
    if (ids.includes(tabNumber.toString())) {
        tabId = tabIdMap[tabNumber.toString()];
        editor.focusModel(tabId);
        module.exports.displayCurrentlyOpenedFileName(tabId);
    }
}

openNewFile = function () {
    try {
        modelName = 'Untitled_' + getLeastAvailableId(unregisteredTabNumberOptimizer);
        unregisteredTabs.push(modelName);
        editor.openNewModel(modelName);
        module.exports.addOpenedFile(modelName, true);
    } catch (e) {
        console.log(e);
        unregisteredTabs.filter(entry => entry != modelName);
    }
}

function handleModelDidChangeEvent(filePath, isUnregistered, tabNumber) {
    if (isUnregistered === true) {
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
}

// closes the tab with ID: filePath
closeTab = function (filePath, forceClose) {
    var type;
    if (unregisteredTabs.includes(filePath)) {
        type = 'unregistered';
        closeUnregisteredTab(filePath, forceClose, type);
    } else {
        type = 'registered';
        closeNormalTab(filePath, forceClose, type);
    }
}

function closeNormalTab(filePath, forceClose, type) {
    var unsavedModels = modelsEventEmitters.getUnsavedModels();
    if (unsavedModels.includes(filePath) && forceClose === false) {
        ipcRenderer.send('open-file-save-check-message-box', { filePath, type });
    } else {
        var tabNumber = document.getElementById('OFDescriptor_' + filePath).children[0].innerHTML;
        tabIdOptimizer[parseInt(tabNumber)] = true;
        delete tabIdMap[parseInt(tabNumber)];

        var tab = document.getElementById('OFContainer_' + filePath);

        modelsEventEmitters.removeModelDidChangeEvent(filePath);

        if (tab) {
            tab.parentNode.removeChild(tab);
            var nextTab = editor.removeModelWithId(filePath);
            if(editor.getCurrentModel() == filePath) {
                editor.focusModel(nextTab);
            }
            module.exports.displayCurrentlyOpenedFileName(nextTab);
        }
    }
}

function closeUnregisteredTab(filePath, forceClose) {
    var unsavedUnregisteredModels = modelsEventEmitters.getUnsavedUnregisteredModels();
    if (unsavedUnregisteredModels.includes(filePath) && forceClose === false) {
        var isRegistered = false;
        ipcRenderer.send('open-file-save-check-message-box', { filePath, isRegistered });
    } else {
        var tabNumber = document.getElementById('OFDescriptor_' + filePath).children[0].innerHTML;
        tabIdOptimizer[parseInt(tabNumber)] = true;
        delete tabIdMap[parseInt(tabNumber)];

        modelsEventEmitters.removeModelDidChangeEvent(filePath);

        var tab = document.getElementById('OFContainer_' + filePath);

        unregisteredTabNumberOptimizer[parseInt(tabNumber)] = true;

        if (tab) {
            tab.parentNode.removeChild(tab);
            var nextTab = editor.removeModelWithId(filePath);
            if(editor.getCurrentModel() == filePath) {
                editor.focusModel(nextTab);
            }
            module.exports.displayCurrentlyOpenedFileName(nextTab);
        }        
    }
}

const path = require('path');
const editor = require('../editor/editor');

registerModel = function(oldPath, newPath) {
    editor.registerModel(oldPath, newPath);
    modelsEventEmitters.registerModel(oldPath, newPath);

    var tabNumber = document.getElementById('OFDescriptor_' + oldPath).children[0].innerHTML;
    unregisteredTabNumberOptimizer[parseInt(tabNumber)] = true;

    handleModelDidChangeEvent(newPath, false, tabNumber);

    var fileName = newPath.split(path.sep).pop();
    document.getElementById('OFDescriptor_' + oldPath).children[2].innerHTML = fileName;

    updateId(oldPath, newPath);

    module.exports.displayCurrentlyOpenedFileName(newPath);
}

function updateId(oldId, newId) {

    document.getElementById(oldId).removeEventListener('click', focusTabClickEventHandler);
    document.getElementById(oldId + "_t").removeEventListener('click', closeTabClickEventHandler);

    document.getElementById(oldId).id = newId;
    document.getElementById(oldId + "_t").id = newId + "_t";

    document.getElementById('OFDescriptor_' + oldId).id = 'OFDescriptor_' + newId;
    document.getElementById('OFContainer_' + oldId).id = 'OFContainer_' + newId;

    addOpenAndCloseEventListeners(newId);
}

focusTabClickEventHandler = function() {
    module.exports.displayCurrentlyOpenedFileName(this.id);
    editor.focusModel(this.id);
}

closeTabClickEventHandler = function() {
    var filePath = this.id.split('_');
    filePath.pop();
    filePath = filePath.join('_');
    module.exports.closeTab(filePath, false);
}

function addOpenAndCloseEventListeners(filePath) {
    document.getElementById(filePath).addEventListener('click', focusTabClickEventHandler);
    document.getElementById(filePath + '_t').addEventListener('click', closeTabClickEventHandler);
}

module.exports = {
    addOpenEditors,
    addOpenedFile,
    notifyIsSaved,
    notifyNeedsSave,
    displayCurrentlyOpenedFileName,
    closeTab,
    gotoTab,
    openNewFile,
    registerModel
}