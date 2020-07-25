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

    if(previousLines) {
        let code = 'if ()';
        let cursorMoveValue = [0, - 1];
        return { code, cursorMoveValue };
    }

    elseIf(previousLines) {
        let code = 'else if ()';
        let cursorMoveValue = [0, - 1];
        return { code, cursorMoveValue };
    }

    while(previousLines) {
        let code = 'while ()';
        let cursorMoveValue = [0, - 1];
        return { code, cursorMoveValue };
    }

    for(previousLines) {
        let code = 'for ()';
        let cursorMoveValue = [0, - 1];
        return { code, cursorMoveValue };
    }

    forLoop(previousLines, loopSize) {
        let code;
        let cursorMoveValue;
        let newScopeSpaces = 4 * (this.getScope(previousLines) + 1);
        let oldScopeSpaces = 4 * (this.getScope(previousLines));
        if (loopSize == undefined) {
            code = `for (let ; ; ) {\n`;
            code += (" ").repeat(newScopeSpaces);
            code += '\n';
            code += (" ").repeat(oldScopeSpaces) + '}';
            cursorMoveValue = [- 2, 8];
        } else {
            code = `for (let i = 0; i < ${loopSize}; i++) {\n`;
            code += (" ").repeat(newScopeSpaces);
            code += '\n';
            code += (" ").repeat(oldScopeSpaces) + '}';
            cursorMoveValue = [- 1, 3];
        }
        return { code, cursorMoveValue };
    }

    print(previousLines) {
        let code = 'console.log()';
        let cursorMoveValue = [0, -1];

        return { code, cursorMoveValue };
    }
}

module.exports = JavascriptCodeInserter;
