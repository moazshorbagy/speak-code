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

    if(lines) {
        let code = 'if ';
        let cursorMoveValue = [0, 0];

        return { code, cursorMoveValue };
    }

    elseIf(lines) {
        let code = 'elif ';
        let cursorMoveValue = [0, 0];

        return { code, cursorMoveValue };
    }

    for(lines) {
        let code = 'for ';
        let cursorMoveValue = [0, 0];

        return { code, cursorMoveValue };
    }

    while(lines) {
        let code = 'while ';
        let cursorMoveValue = [0, 0];

        return { code, cursorMoveValue };
    }

    forLoop(previousLines, loopSize) {
        let code;
        let cursorMoveValue;
        let numberOfSpaces = 4 * (this.getScope(currentLine) + 1);
        let currentLine = previousLines[previousLines.length - 1];

        if (loopSize == undefined) {
            code = `for  in range():\n`;
            cursorMoveValue[-1, 0];
        } else {
            code = `for i in range(${loopSize}):\n`;
            cursorMoveValue = [0, 0];
        }

        code += (" ").repeat(numberOfSpaces);

        return { code, cursorMoveValue };
    }

    print(previousLines) {
        let code = 'print()';
        let cursorMoveValue = [0, -1];

        return { code, cursorMoveValue };
    }
}
