
function loadPanel() {
    let filenameElement = `<p id='opened-file-name'> </p>`;
    let fileSavedStateElement = `<p id='saved-state'> </p>`;
    let cursorPosition = `<p id='cursor-notifier'> </p>`;
    $("#top-panel").append(`<div id='listening-notifier-container'></div>`);
    let listeningNotifierIcon = `<img id='listening-notifier-icon' src='icons/circle.svg'></img>`;
    let listeningNotifierText = `<p id='listening-notifier-text'> Not Listening </p>`;
    $("#listening-notifier-container").append(`${listeningNotifierIcon} ${listeningNotifierText}`);
    let fileInfo = filenameElement + fileSavedStateElement + cursorPosition;
    $("#top-panel").append(fileInfo);
    $(document).ready(function(e) {
        document.getElementById('listening-notifier-icon').addEventListener('click', listeningNotifierIconOnClickHandler); 
    });
}

function setListeningState(isListening) {
    if(isListening === true) {
        $("#listening-notifier-text").text("Listening..");
        let filterVal = "invert(50%) sepia(86%) saturate(1456%) hue-rotate(78deg) brightness(115%) contrast(90%)";
        $("#listening-notifier-icon").css("filter", filterVal);
    } else {
        $("#listening-notifier-text").text("Not Listening");
        let filterVal = "invert(18%) sepia(76%) saturate(3501%) hue-rotate(350deg) brightness(94%) contrast(94%)";
        $("#listening-notifier-icon").css("filter", filterVal);
    }
}

function listeningNotifierIconOnClickHandler(event) {
    let isListening = ipcRenderer.sendSync('toggle-is-listening');
    setListeningState(isListening);
}

module.exports = {
    loadPanel,
    setListeningState
}