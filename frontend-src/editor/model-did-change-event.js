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
    }
}

registerModel = function(oldName, newPath) {
    if(Object.keys(unregisteredModelsEventEmitters).includes(oldName)) {
        delete unregisteredModelsEventEmitters[oldName];
        module.exports.addModelEventEmitter(newPath, false);
        unsavedUnregisteredModels = unsavedUnregisteredModels.filter(entry => entry !== oldName);
    }
}

removeModelDidChangeEvent = function(filePath) {
    if(Object.keys(unregisteredModelsEventEmitters).includes(filePath)) {
        delete unregisteredModelsEventEmitters[filePath];
        unsavedUnregisteredModels = unsavedUnregisteredModels.filter(entry => entry !== filePath);
    } else if (Object.keys(modelsEventEmitters).includes(filePath)) {
        delete modelsEventEmitters[filePath];
        unsavedModels = unsavedModels.filter(entry => entry !== filePath);
    }
}

module.exports = {
    getModelsEventEmitters,
    addModelEventEmitter,
    emitModelIsSaved,
    emitModelNeedsToBeSaved,
    getUnsavedModels,
    getUnregisteredModelsEventEmitters,
    getUnsavedUnregisteredModels,
    registerModel,
    removeModelDidChangeEvent
}