
let _class = ' fileNameSpan';

const fs = require('fs');
const Path = require('path')

addCollapsible = function (container, divId, path, name, content) {

    // the container div that encloses a folder and its content.
    container.append("<div id='" + divId + "'> </div>");

    // the div to append collapsible div and content div to.
    var div = $("#" + divId);

    /// The folder div only contains the folder name and an event listener is attached to it.
    div.append("<div class='" + _class + "' id='b" + divId + "'> > " + name + "</div>");

    /// The content container which holds the files and the folders all whith class='content'.
    div.append("<div id='c" + divId + "' class='content " + _class + "'></div>");

    // the content div that holds the folder content
    var contentContainer = $('#c' + divId);

    folders = content.filter(entry => entry.isDirectory());
    populateFolders(folders, path, contentContainer);

    otherTypes = content.filter(entry => !(entry.isDirectory() || entry.isFile()));
    populateOtherTypes(otherTypes, path, contentContainer);

    files = content.filter(entry => entry.isFile());
    populateFiles(files, path, contentContainer);

    $(document).ready(function() {
        document.getElementById('b' + divId).addEventListener('click', function() {
            var content = this.nextElementSibling;
            if (content.style.display === "block") {
                content.style.display = "none";
            } else {
                content.style.display = "block";
            }
        })
    });
}

populateFiles = function (files, path, contentContainer) {
    for (let i = 0; i < files.length; i++) {
        contentId = Path.join(path, files[i].name);
        contentContainer.append("<div id='" + contentId + "' class='" + _class + "'>" + files[i].name + "</div> ");

        document.getElementById(contentId).addEventListener('click', function () {
            var doc = fs.readFileSync(this.id, "utf8");
            const monacoEditor = require('../editor/editor');
            monacoEditor.openDoc(doc, this.id);
        }, false);
    }
}

populateFolders = function (folders, path, explorerContainer) {
    for (let i = 0; i < folders.length; i++) {
        var folderPath = Path.join(path, folders[i].name);
        folderName = folderPath.split('/').pop();
        contentId = folderPath.split('/').join('');
        contentId = contentId.replace(/[^0-9a-zA-Z_-]/g, '');
        module.exports.addCollapsible(explorerContainer, contentId, folderPath, folderName, fs.readdirSync(folderPath, { withFileTypes: true }));
    }
}

populateOtherTypes = function(files, path, contentContainer) {
    for(let i = 0; i < files.length; i++) {
        var contentId = Path.join(path, files[i].name);
        contentContainer.append("<div id='" + contentId + "' class='" + _class + "'>" + files[i].name + "</div> ");
    }
}

module.exports = { addCollapsible }