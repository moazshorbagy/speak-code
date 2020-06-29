module.exports = class PythonCodeInserter {
    getScope(currentLine) {
        let k = 0;
        for (let i = 0; i < currentLine.length; i++) {
            if (currentLine[i] == ' ') {
                k += 1;
            } else {
                break;
            }
        }
        return k / 4;
    }

    newScope(lines) {
        let currentLine = lines[lines.length - 1];
        
        let code = ":\n";
    
        let newScope = 4 * (this.getScope(currentLine) + 1);
    
        code += (" ").repeat(newScope);
    
        return code;
    }

    exitScope(lines) {
        let currentLine = lines[lines.length - 1];

        let code = "\n";
    
        let newScope = Math.max(4 * (this.getScope(currentLine) - 1), 0);
    
        code += (" ").repeat(newScope);
    
        return code;
    }  
    
    enter(lines) {
        let currentLine = lines[lines.length - 1];

        let code = "\n";
    
        code += (" ").repeat(this.getScope(currentLine) * 4);
    
        return code;
    }
}
