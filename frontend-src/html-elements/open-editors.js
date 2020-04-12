
var openEditorsId = 'open-editors';

var openEditorsClass = 'leftpanel preventSelect fileNameSpan';

var openEditorsContentContainerId = 'open-editors-content-container';

var openEditorsContentContainerClass = 'open-editors-content';

const Path = require('path');

const editor = require('../editor/editor');

const modelsEventEmitters = require('../editor/model-did-change-event');

// for new tabs 
tabsCount = 0;

addOpenEditors = function () {
    var openEditorsContainer = $('#open-editors-container');

    openEditorsContainer.css("margin-top", "30px");

    openEditorsContainer.append("<div id='" + openEditorsId + "' class='" + openEditorsClass + "'> > Opened files </div>");

    openEditorsContainer.append("<div id='" + openEditorsContentContainerId + "' class='" + openEditorsContentContainerClass + "'> </div>");

    $("#" + openEditorsContentContainerId).css("display", "block");

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

    modelsDidChangedEvents = modelsEventEmitters.modelsEventEmitters;
    modelsDidChangedEvents[filePath].on('needs-save', (filePath) => {
        module.exports.notifyNeedsSave(filePath);
    });

    modelsDidChangedEvents[filePath].on('saved', (filePath) => {
        module.exports.notifyIsSaved(filePath);
    });

    var tabId = filePath + "_t";

    var closeTabIcon = "<img id='" + tabId + "' src='icons/close-24px.svg' class='float-left'> </img>";

    openEditorsContentContainer.append("<div id='" + filePath + "' class='fileNameSpan'> <div class='folder-descriptor'>" + closeTabIcon + "<p class='float-left'>" + fileName + " </p> </div> </div>");

    document.getElementById(filePath).addEventListener('click', function () {
        editor.focusModel(filePath);
    });

    document.getElementById(tabId).addEventListener('click', function() {
        var tab = this.id.split('_')[0];
        var element = document.getElementById(tab);
        element.parentNode.removeChild(element);
        editor.removeModelWithId(tab);
    });
}

notifyIsSaved = function(filePath) {
    console.log(filePath);
    document.getElementById(filePath + '_t').src = 'icons/close-24px.svg';
    console.log('should be printed if ctrl+S is clicked');
}

notifyNeedsSave = function(filePath) {
    document.getElementById(filePath + '_t').src = 'icons/modified.svg';
    console.log('should be printed if needs saved');
}

module.exports = {
    addOpenEditors,
    addOpenedFile,
    notifyIsSaved,
    notifyNeedsSave
}