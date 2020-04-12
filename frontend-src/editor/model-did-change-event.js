const EventEmitter = require('events');

class ModelDidChangeEventEmitter extends EventEmitter {}

let modelsEventEmitters = {};

addModelEventEmitter = function(filePath) {
    modelsEventEmitters[filePath] = new ModelDidChangeEventEmitter(filePath);
    console.log(modelsEventEmitters);
}

emitModelNeedsToBeSaved = function(filePath) {
    modelsEventEmitters[filePath].emit('needs-save', filePath);
}

emitModelIsSaved = function(filePath) {
    modelsEventEmitters[filePath].emit('saved', filePath);
}

module.exports = {
    modelsEventEmitters,
    addModelEventEmitter,
    emitModelIsSaved,
    emitModelNeedsToBeSaved
}