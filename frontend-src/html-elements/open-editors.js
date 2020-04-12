
var openEditorsId = 'open-editors';

var openEditorsClass = 'leftpanel preventSelect fileNameSpan';

var openEditorsContentContainerId = 'open-editors-content-container';

var openEditorsContentContainerClass = 'open-editors-content';

const Path = require('path');

const editor = require('../editor/editor');

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

    var contentId = filePath.replace(/[^\u0600-\u06FF0-9a-zA-Z_-]/g, '-');


    var tabId = contentId + "_" + tabsCount;

    var closeTabIcon = "<img id='" + tabId + "' src='icons/close-24px.svg' class='float-left'> </img>";

    openEditorsContentContainer.append("<div id='" + contentId + "' class='fileNameSpan'> <div class='folder-descriptor'>" + closeTabIcon + "<p class='float-left'>" + fileName + " </p> </div> </div>");

    tabsCount++;

    document.getElementById(contentId).addEventListener('click', function () {
        editor.focusModel(filePath);
    });

    document.getElementById(tabId).addEventListener('click', function() {
        var tab = this.id.split('_')[0];
        $("#" + tab).remove();
    });
}

removeOpenedFile = function (filePath) {
    var openEditorsContentContainer = $("#" + openEditorsContentContainerId);
}

module.exports = {
    addOpenEditors,
    addOpenedFile
}