
let _class = ' fileNameSpan';

const fs = require('fs');
const Path = require('path');

const closedFolderIcon = "<img src='icons/folder-24px.svg' class='float-left'> </img>";


addCollapsible = function (container, path, name, content, isRootDir) {

    // the container div that encloses a folder and its content.
    container.append("<div id='" + path + "'> </div>");

    // the div to append collapsible div and content div to.
    var div = $('#' + $.escapeSelector(path));

    // The folder div only contains the folder name and an event listener is attached to it.
    div.append("<div class='" + _class + "' id='b" + path + "'> <div class='folder-descriptor'>" + closedFolderIcon + "<p class='float-left'>" + name + " </p> </div> </div>");

    // The content container which holds the files and the folders all whith class='content'.
    div.append("<div id='c" + path + "' class='content " + _class + "'></div>");

    // the content div that holds the folder content
    var contentContainer = $('#c' + $.escapeSelector(path));
    var folderDescriptor = $('#b' + $.escapeSelector(path));

    folders = content.filter(entry => entry.isDirectory());
    populateFolders(folders, path, contentContainer);

    otherTypes = content.filter(entry => !(entry.isDirectory() || entry.isFile()));
    populateOtherTypes(otherTypes, path, contentContainer);

    files = content.filter(entry => entry.isFile());
    populateFiles(files, path, contentContainer);

    // add a border to the root directory
    // expand by default the root dir only.
    if (isRootDir) {
        div.css("border-bottom", "1px solid black");
        contentContainer.css("display", "block");
    }

    folderDescriptor.on('click', function () {
        var folderPath = this.id.substring(1);
        expandFolder(folderPath);
    });
}

populateFiles = function (files, path, contentContainer) {
    for (let i = 0; i < files.length; i++) {
        contentId = Path.join(path, files[i].name);
        contentContainer.append("<div id='" + contentId + "' class='" + _class + "'>" + files[i].name + "</div> ");
        c = $('#' + $.escapeSelector(contentId));
        c.on('click', fileEventHandlers);
    }
}

expandFolder = function (folderPath) {
    folderDescriptor = document.getElementById('b' + folderPath);
    var content = folderDescriptor.nextElementSibling;
    if (content.style.display === "block") {
        content.style.display = "none";
    } else {
        content.style.display = "block";
    }
}

focusFolder = function (folderPath) {
    element = document.getElementById('b' + folderPath);
    element.style.background = '#000000';
}

unfocusFolder = function (folderPath) {
    element = document.getElementById('b' + folderPath);
    element.style.background = 'unset';
}

function smallScript(e) {
    if (e.keyCode == 13) {
        e.srcElement.contentEditable = false;
        e.srcElement.value = e.target.textContent;
        renameFile(e.srcElement.id, e.srcElement.value);
    }
}

function fileEventHandlers(event) {
    e = event.originalEvent;
    if (e.srcElement === document.activeElement) {
        return;
    }
    elementId = e.srcElement.id;
    if (e.detail == 2) {
        clearTimeout(pendingClick);
        e.srcElement.contentEditable = true;
        e.srcElement.focus();
        e.srcElement.addEventListener('keydown', smallScript);
        return;
    }

    pendingClick = setTimeout(function () {
        module.exports.openFile(elementId);
    }, 300);
}

// just does the function of renaming the file.
function renameFile(filePath, newName) {
    directoryPath = filePath.split(Path.sep);
    directoryPath.pop();
    directoryPath = directoryPath.join(Path.sep);
    var newPath = directoryPath + Path.sep + newName;
    fs.renameSync(filePath, newPath);

    oldElement = document.getElementById(filePath);
    oldElement.id = newPath;
}

populateFolders = function (folders, path, explorerContainer) {
    for (let i = 0; i < folders.length; i++) {
        var folderPath = Path.join(path, folders[i].name);
        folderName = folderPath.split(Path.sep).pop();
        module.exports.addCollapsible(explorerContainer, folderPath, folderName, fs.readdirSync(folderPath, { withFileTypes: true }));
    }
}
openFile = function (filePath) {
    try {
        let doc = fs.readFileSync(filePath, "utf8");
        if (!editor.modelIsAlreadyOpen(filePath)) {
            editor.openDoc(doc, filePath);
            openedFiles.addOpenedFile(filePath);
        } else {
            editor.focusModel(filePath);
            openedFiles.displayCurrentlyOpenedFileName(filePath.split(Path.sep).pop());
        }
    } catch (error) {
        // TODO: Remove from list of opened editors
        // TODO: Remove from list of opened tabs
        // TODO: Remove from list of files in directory or refresh working directory
        console.log(`Error: File ${filePath} does not exist`)
        return;
    }
}

populateOtherTypes = function (files, path, contentContainer) {
    for (let i = 0; i < files.length; i++) {
        var contentId = Path.join(path, files[i].name);
        contentContainer.append("<div id='" + contentId + "' class='" + _class + "'>" + files[i].name + "</div> ");
    }
}

module.exports = {
    addCollapsible,
    openFile,
    expandFolder,
    focusFolder,
    unfocusFolder
}