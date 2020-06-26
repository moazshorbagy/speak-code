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

previousLines = [
    'line1 = function() {\n',
    '   console.log("Hello World!")\n',
    '}\n',
    'function anotherFunction(params) { // {\n',
    '    console.log("hey");\n',
    '    if(params === "world") {\n',
    '        console.log("params")\n',
    '    } else'
];
inserter = new JavascriptCodeInserter();
previousLines.push(inserter.newScope(previousLines));
previousLines.push('console.log("In a new scope");');
previousLines.push(inserter.enter(previousLines));
previousLines.push('console.log("Still in the new scope");');
previousLines.push(inserter.exitScope(previousLines));
previousLines.push('console.log("Out of the scope now");');
previousLines.push(inserter.exitScope(previousLines));

previousLines.forEach(line => process.stdout.write(line));
