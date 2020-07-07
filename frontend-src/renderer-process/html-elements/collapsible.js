
let _class = ' fileNameSpan';

const fs = require('fs');
const Path = require('path');

const openedFolderIconSrc = 'icons/folder_open-24px.svg';
const closedFolderIconSrc = 'icons/folder-24px.svg';

const fileIcon = "<img style='pointer-events: none;' src='icons/code-file24px.svg' class='float-left'> </img>";
const otherTypesIcon = "<img style='pointer-events: none;' src='icons/regular-file24.svg' class='float-left'> </img>"

addCollapsible = function (container, path, name, content, isRootDir) {

    // the container div that encloses a folder and its content.
    container.append("<div id='" + path + "'> </div>");

    // the div to append collapsible div and content div to.
    var div = $('#' + $.escapeSelector(path));

    const folderIcon = `<img id='${'ico_' + path}' src='${closedFolderIconSrc}' class='float-left'> </img>`;

    // The folder div only contains the folder name and an event listener is attached to it.
    div.append("<div class='" + _class + "' id='b" + path + "'> <div class='descriptor'>" + folderIcon + "<p class='float-left' style='font-weight: bolder;'>" + name + " </p> </div> </div>");

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
        div.css("border-top", "1px solid black");
        contentContainer.css("display", "block");
        document.getElementById('ico_' + path).src = openedFolderIconSrc;
    }

    folderDescriptor.on('click', function () {
        var folderPath = this.id.substring(1);
        toggleContentVisible(folderPath);
    });
}

populateFiles = function (files, path, contentContainer) {
    for (let i = 0; i < files.length; i++) {
        contentId = Path.join(path, files[i].name);
        let file = createFile(contentId, files[i].name, contentContainer);
        contentContainer.append(file);
        c = $('#FDescriptor_' + $.escapeSelector(contentId));
        c.on('click', fileEventHandlers);
    }
}

function createFile(contentId, name) {
    let fileDescriptor;
    fileDescriptor = `<div id='${'FDescriptor_' + contentId}' class='descriptor'>`;
    fileDescriptor += fileIcon + `<p style='pointer-events: none' 
    id='name_${name}' style='font-weight: bolder;' class='float-left'> ${name} </p> </div>`;
    return `<div id='${contentId}' class='${_class}'> ${fileDescriptor} </div>`;
}

expandFolder = function (folderPath) {
    try {
        folderDescriptor = document.getElementById('b' + folderPath);
        var content = folderDescriptor.nextElementSibling;
        if (content.style.display !== "block") {
            document.getElementById('ico_' + folderPath).src = openedFolderIconSrc;
            content.style.display = "block";
        }
    } catch (e) {
        console.log(e);
    }
}

function toggleContentVisible(folderPath) {
    try {
        folderDescriptor = document.getElementById('b' + folderPath);
        var content = folderDescriptor.nextElementSibling;
        if (content.style.display === "block") {
            document.getElementById('ico_' + folderPath).src = closedFolderIconSrc;
            content.style.display = "none";
        } else {
            document.getElementById('ico_' + folderPath).src = openedFolderIconSrc;
            content.style.display = "block";
        }
    } catch (e) {
        console.log(e);
    }
}

collapseFolder = function (folderPath) {
    try {
        folderDescriptor = document.getElementById('b' + folderPath);
        var content = folderDescriptor.nextElementSibling;
        if (content.style.display != "none") {
            content.style.display = "none";
            document.getElementById('ico_' + folderPath).src = closedFolderIconSrc;
        }
    } catch (e) {
        console.log(e);
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

function fileEventHandlers(event) {
    let e = event.originalEvent;
    let filePath = e.srcElement.id.split('_');
    filePath.shift();
    filePath = filePath.join('_');
    module.exports.openFile(filePath);
}

// just does the function of renaming the file.
function systemRenameFile(oldId, newName) {
    let filePath = oldId.split('_');
    filePath.shift();
    filePath = filePath.join(Path.sep);
    let directoryPath = filePath.split(Path.sep);
    directoryPath.pop();
    directoryPath = directoryPath.join(Path.sep);
    let newPath = Path.join(directoryPath, newName);
    fs.renameSync(filePath, newPath);
}

function updateId(oldId, newId) {
    try {
        document.getElementById(oldId).removeEventListener('click', fileEventHandlers);
        document.getElementById(oldId).id = newId;
        document.getElementById(newId).addEventListener('click', fileEventHandlers);
    } catch(e) {
        console.log(e);
    }
 }

function addFile(filePath) {
    let directoryPath = filePath.split(Path.sep);
    directoryPath.pop();
    directoryPath = directoryPath.join(Path.sep);
    let contentContainer = $("#c" + $.escapeSelector(directoryPath));
    let name = filePath.split(Path.sep).pop();
    let file = createFile(filePath, name);
    let neighbors = contentContainer.children();

    for(let i = 0; i < neighbors.length; i++) {
        if(neighbors[i].id === filePath) {
            return;
        }
    }


    let followingIndex;
    for(let i = 0; i < neighbors.length; i++) {
        if(neighbors[i].children.length < 2 && neighbors[i].id > filePath) {
            followingIndex = i;
        }
    }
    if(followingIndex === undefined) {
        contentContainer.append(file);
    } else if(followingIndex === neighbors.length - 1) {
        if(neighbors[followingIndex].children.length < 2 && neighbors[followingIndex].id > filePath) {
            $(file).insertBefore('#' + $.escapeSelector(neighbors[followingIndex].id));
        } else {
            $(file).insertAfter('#' + $.escapeSelector(neighbors[followingIndex].id));
        }
    }

    c = $('#FDescriptor_' + $.escapeSelector(filePath));
    c.on('click', fileEventHandlers);
}

function removeFile(filePath) {
    try {
        let id = 'FDescriptor_' + filePath;
        let element = document.getElementById(id);
        element.parentNode.removeChild(element);
    } catch(e) {
        console.log(e);
    }
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
        populateOtherTypeFile(contentId, files[i].name, contentContainer)
    }
}

function populateOtherTypeFile(contentId, name, contentContainer) {
    fileDescriptor = `<div id='${'FDescriptor_' + contentId}' class='descriptor'>`;
    fileDescriptor += otherTypesIcon + `<p style='pointer-events: none' 
    id='name_${name}' style='font-weight: bolder;' class='float-left'> ${name} </p> </div>`;
    contentContainer.append(`<div id='${contentId}' class='${_class}'> ${fileDescriptor} </div> `);
}

module.exports = {
    addCollapsible,
    openFile,
    expandFolder,
    focusFolder,
    unfocusFolder,
    collapseFolder,
    addFile
}