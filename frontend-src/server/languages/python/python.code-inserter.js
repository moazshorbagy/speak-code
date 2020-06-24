module.exports = class PythonCodeInserter {
    getScope(currentLine) {
        var k = 0;
        for (let i = 0; i < currentLine.length; i++) {
            if (currentLine[i] == ' ') {
                k += 1;
            } else {
                break;
            }
        }
        return k / 4;
    }

    newScope(line) {
        var code = ":\n";
    
        var newScope = 4 * (this.getScope(line) + 1);
    
        code += (" ").repeat(newScope);
    
        return code;
    }

    exitScope(line) {
        var code = "\n";
    
        var newScope = Math.max(4 * (this.getScope(line) - 1), 0);
    
        code += (" ").repeat(newScope);
    
        return code;
    }  
    
    enter(line) {

        var code = "\n";
    
        code += (" ").repeat(this.getScope(line) * 4);
    
        return code;
    }
}
