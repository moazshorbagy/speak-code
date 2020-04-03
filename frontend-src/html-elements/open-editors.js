
var openEditorsId = 'open-editors';

var openEditorsClass = 'leftpanel preventSelect fileNameSpan';

var openEditorsContentContainerId = 'open-editors-content-container';

var openEditorsContentContainerClass = 'open-editors-content';

const Path = require('path');

const editor = require('../editor/editor');

addOpenEditors = function () {
    var openEditorsContainer = $('#open-editors-container');

    openEditorsContainer.css("margin-top", "30px");

    openEditorsContainer.append("<div id='" + openEditorsId + "' class='" + openEditorsClass + "'> > Open files </div>");

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

    openEditorsContentContainer.append("<div id='" + filePath + "' class='fileNameSpan'>" + fileName + "</div>");

    document.getElementById(filePath).addEventListener('click', function () {
        editor.setModelWithId(filePath);
        editor.retrieveCursorPosition(filePath);
    });
}

removeOpenedFile = function (filePath) {
    var openEditorsContentContainer = $("#" + openEditorsContentContainerId);
}

module.exports = {
    addOpenEditors,
    addOpenedFile
}