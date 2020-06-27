class JavascriptCodeInserter {
    getScope(previousLines) {
        let scope = 0;

        previousLines.forEach(line => {     
            for (let i = 0; i < line.length; i++) {
                if (line[i] == '/' && i < line.length - 1 && line[i + 1] == '/') {
                    break;
                }
                if (line[i] == '{') {
                    scope += 1;
                } else if (line[i] == '}') {
                    scope -= 1;
                }
            }
        });

        return Math.max(scope, 0);
    }

    newScope(previousLines) {
        let code = " {\n";

        let numberOfSpaces = 4 * (this.getScope(previousLines) + 1);

        code += (" ").repeat(numberOfSpaces);

        return code;
    }

    exitScope(previousLines) {
        let code = "\n";

        let numberOfSpaces = 4 * (this.getScope(previousLines) - 1);
        numberOfSpaces = Math.max(numberOfSpaces, 0);

        code += (" ").repeat(numberOfSpaces);
        code += "}\n"
        code += (" ").repeat(numberOfSpaces);

        return code;
    }

    enter(previousLines) {
        let code = "\n";

        let numberOfSpaces = 4 * this.getScope(previousLines);

        code += (" ").repeat(numberOfSpaces);

        return code;
    }
}

module.exports = JavascriptCodeInserter;
