const EventEmitter = require('events');

class ModelDidChangeEventEmitter extends EventEmitter {}

let modelsEventEmitters = {};

let unsavedModels = [];

let unregisteredModelsEventEmitters = {};

let unsavedUnregisteredModels = [];

addModelEventEmitter = function(filePath, isUnregistered) {
    if(isUnregistered === true) {
        unregisteredModelsEventEmitters[filePath] = new ModelDidChangeEventEmitter();
    } else {
        modelsEventEmitters[filePath] = new ModelDidChangeEventEmitter();
    }
}

getUnsavedModels = function() {
    return unsavedModels;
}

getUnsavedUnregisteredModels = function() {
    return unsavedUnregisteredModels;
}

getUnregisteredModelsEventEmitters = function() {
    return unregisteredModelsEventEmitters;
}

getModelsEventEmitters = function() {
    return modelsEventEmitters;
}

emitModelNeedsToBeSaved = function(filePath, isUnregistered) {
    if(isUnregistered === true) {
        unregisteredModelsEventEmitters[filePath].emit('needs-save-as', filePath);
        if(!unsavedUnregisteredModels.includes(filePath)) {
            unsavedUnregisteredModels.push(filePath);
        }
    } else {
        modelsEventEmitters[filePath].emit('needs-save', filePath);
        if(!unsavedModels.includes(filePath)) {
            unsavedModels.push(filePath);  
        }  
    }
}

emitModelIsSaved = function(filePath, isUnregistered) {
    if(isUnregistered === true) {
        unregisteredModelsEventEmitters[filePath].emit('saved-as', filePath);
        unsavedUnregisteredModels = unsavedUnregisteredModels.filter(entry => entry !== filePath);
    } else {
        unsavedModels = unsavedModels.filter(entry => entry !== filePath);
        modelsEventEmitters[filePath].emit('saved', filePath);
        console.log(unsavedModels);
    }
}

module.exports = {
    getModelsEventEmitters,
    addModelEventEmitter,
    emitModelIsSaved,
    emitModelNeedsToBeSaved,
    getUnsavedModels,
    getUnregisteredModelsEventEmitters,
    getUnsavedUnregisteredModels
}