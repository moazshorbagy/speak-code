const EventEmitter = require('events');

class ModelDidChangeEventEmitter extends EventEmitter {}

let modelsEventEmitters = {};

let unsavedModels = [];

addModelEventEmitter = function(filePath) {
    modelsEventEmitters[filePath] = new ModelDidChangeEventEmitter(filePath);
}

emitModelNeedsToBeSaved = function(filePath) {
    modelsEventEmitters[filePath].emit('needs-save', filePath);
    unsavedModels.push(filePath);
}

emitModelIsSaved = function(filePath) {
    modelsEventEmitters[filePath].emit('saved', filePath);
    unsavedModels.filter(entry => entry === filePath);
}

module.exports = {
    modelsEventEmitters,
    addModelEventEmitter,
    emitModelIsSaved,
    emitModelNeedsToBeSaved,
    unsavedModels
}