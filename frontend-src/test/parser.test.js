const assert = require('assert');
const parser = require('../server/parser');
const pythonLang = require('../server/languages/python/python-lang.json');
const { AssertionError } = require('assert');

describe('Function: Form Numbers', function () {
    it('Should convert string array of text into numbers', function () {
        input = ['one', 'two', 'three'];
        expectedOutput = ['123'];

        actualOutput = parser.formNumbers(input);

        assert.equal(actualOutput.length, expectedOutput.length, `Array lengths are not equal: expected ${expectedOutput.length} but got ${actualOutput.length}.`);
        for (let i = 0; i < expectedOutput.length; i++) {
            assert.equal(actualOutput[i], expectedOutput[i], `Elements not the same: expected ${expectedOutput[i]} but got ${actualOutput[i]}.`);
        }
    });

    it('Should leave the element that is not a number as it is', function () {
        input = ['two', 'three', 'equals', 'one', 'eight'];
        expectedOutput = ['23', 'equals', '18'];

        actualOutput = parser.formNumbers(input);

        assert.equal(actualOutput.length, expectedOutput.length, `Array lengths are not equal: expected ${expectedOutput.length} but got ${actualOutput.length}.`);
        for (let i = 0; i < expectedOutput.length; i++) {
            assert.equal(actualOutput[i], expectedOutput[i], `Elements not the same: expected ${expectedOutput[i]} but got ${actualOutput[i]}.`);
        }
    });

    it('Should throw error if input is not an array', function () {
        input = 'one two three';

        assert.throws(() => parser.formNumbers(input), TypeError, 'It did not throw TypeError as expected.');
    });

    it('Should throw error if parameters are missing', function () {
        assert.throws(() => parser.formNumbers(), Error, 'It did not throw Error as expected.');
    });
});


describe('Function: Build Variable Name', function () {
    it('Should convert string array to camel-case variable name', function () {
        input = ['variable', 'my', 'new', 'variable', 'camel'];
        expectedOutput = 'myNewVariable';

        actualOutput = parser.buildVariableName(input);

        assert.equal(actualOutput, expectedOutput, `Variable names are different: expected ${expectedOutput} but got ${actualOutput}.`);
    });

    it('Should convert string array to snake-case variable name', function () {
        input = ['variable', 'my', 'new', 'variable', 'snake'];
        expectedOutput = 'my_new_variable';

        actualOutput = parser.buildVariableName(input);

        assert.equal(actualOutput, expectedOutput, `Variable names are different: expected ${expectedOutput} but got ${actualOutput}.`);
    });

    it('Should convert string array to pascal-case variable name', function () {
        input = ['variable', 'my', 'new', 'variable', 'pascal'];
        expectedOutput = 'MyNewVariable';

        actualOutput = parser.buildVariableName(input);

        assert.equal(actualOutput, expectedOutput, `Variable names are different: expected ${expectedOutput} but got ${actualOutput}.`);
    });

    it('Should convert two variable names', function () {
        input = ['if', 'variable', 'my', 'new', 'variable', 'pascal', 'equals', 'variable', 'my', 'new', 'variable', 'camel', 'plus'];
        expectedOutput = ['if', 'MyNewVariable', 'equals', 'myNewVariable', 'plus'];

        actualOutput = parser.buildVariableName(input);

        assert.equal(actualOutput.length, expectedOutput.length,
            `Arrays lengths are different: expected ${expectedOutput.length} but got ${actualOutput.length}.`);

        for (let i = 0; i < expectedOutput.length; i++) {
            assert.equal(actualOutput[i], expectedOutput[i],
                `Variable names are different: expected ${expectedOutput[i]} but got ${actualOutput[i]}.`);
        }
    });

    it('Should throw error if input is not an array', function () {
        input = 'variable my new variable snake';

        assert.throws(() => parser.buildVariableName(input), TypeError, 'It did not throw TypeError as expected.');
    });

    it('Should throw error if parameters are missing', function () {
        assert.throws(() => parser.buildVariableName(), Error, 'It did not throw Error as expected.');
    });
});


describe('Function: Form Lang Commands', function () {
    it('Should convert multi-word commands to one word', function () {
        input = ['else', 'if', 'bracket'];
        expectedOutput = ['else-if', 'bracket'];

        actualOutput = parser.formLangCommands(input, pythonLang);

        assert.equal(actualOutput.length, expectedOutput.length, `Array lengths are not equal: expected ${expectedOutput.length} but got ${actualOutput.length}.`);

        for (let i = 0; i < expectedOutput.length; i++) {
            assert.equal(actualOutput[i], expectedOutput[i], `Elements not the same: expected ${expectedOutput[i]} but got ${actualOutput[i]}.`);
        }
    });

    it('Should throw error if input is not an array', function () {
        input = 'some random text';

        assert.throws(() => parser.formLangCommands(input, pythonLang), TypeError, 'It did not throw TypeError as expected.');
    });

    it('Should throw error if parameters are missing', function () {
        assert.throws(() => parser.formLangCommands(input), Error, 'It did not throw Error as expected.');
    });
});


describe('Function: Form Commands', function () {
    it('Should convert multi-word commands to one word', function () {
        input = ['start', 'listening', 'bracket'];
        expectedOutput = ['start-listening', 'bracket'];

        actualOutput = parser.formEditorCommands(input);

        assert.equal(actualOutput.length, expectedOutput.length, `Array lengths are not equal: expected ${expectedOutput.length} but got ${actualOutput.length}.`);

        for (let i = 0; i < expectedOutput.length; i++) {
            assert.equal(actualOutput[i], expectedOutput[i], `Elements not the same: expected ${expectedOutput[i]} but got ${actualOutput[i]}.`);
        }
    });
});

describe('Function: Is Word Not In Grammar', function () {
    it('Should return true when a word is not in grammar', function () {
        input = 'some_random_word';
        expectedOutput = true;

        actualOutput = parser.isWordNotInGrammar(input, pythonLang);

        assert.equal(actualOutput, expectedOutput, `Error: expected ${expectedOutput} but got ${actualOutput}.`);
    });

    it('Should return false when a word is in grammar', function () {
        input = 'else-if';
        expectedOutput = false;

        actualOutput = parser.isWordNotInGrammar(input, pythonLang);

        assert.equal(actualOutput, expectedOutput, `Error: expected ${expectedOutput} but got ${actualOutput}.`);
    });

    it('Should throw error when empty string is sent', function () {
        input = '';

        assert.throws(() => parser.isWordNotInGrammar(input, pythonLang), Error, 'It did not throw Error as expected.');
    });

    it('Should throw error if input is not a string', function () {
        input = ['some', 'random', 'text'];

        assert.throws(() => parser.isWordNotInGrammar(input, pythonLang), TypeError, 'It did not throw TypeError as expected.');
    });

    it('Should throw error if parameters are missing', function () {
        input = 'some_random_word';

        assert.throws(() => parser.isWordNotInGrammar(input), Error, 'It did not throw Error as expected.');
    });
});


describe('Preprocessing 1 and 2', function () {
    it('Should perform preprocessing correctly', function () {
        input = 'start listening else if one three equals three one';
        expectedOutput = ['else-if', '13', 'equals', '31'];

        actualOutput = parser.preprocessing2(parser.preprocessing1(input), pythonLang);

        assert.equal(actualOutput.length, expectedOutput.length, `Array lengths are not equal: expected ${expectedOutput.length} but got ${actualOutput.length}.`);
        for (let i = 0; i < expectedOutput.length; i++) {
            assert.equal(actualOutput[i], expectedOutput[i], `Elements not the same: expected ${expectedOutput[i]} but got ${actualOutput[i]}.`);
        }
    });

    it('should discard all said words before saying "start listening"', function () {
        input = 'stop listening if strange xenon strange start listening strange xenon strange';
        expectedOutput = ['x'];

        actualOutput = parser.preprocessing2(parser.preprocessing1(input), pythonLang);
        console.log(actualOutput);


        assert.equal(actualOutput.length, expectedOutput.length, `Array lengths are not equal: expected ${expectedOutput.length} but got ${actualOutput.length}.`);
        for (let i = 0; i < expectedOutput.length; i++) {
            assert.equal(actualOutput[i], expectedOutput[i], `Elements not the same: expected ${expectedOutput[i]} but got ${actualOutput[i]}.`);
        }
    });

    it('should discard all said words after saying "stop listening"', function () {
        input = 'start listening if strange xenon strange stop listening strange xenon strange';
        expectedOutput = ['if', 'x'];

        actualOutput = parser.preprocessing2(parser.preprocessing1(input), pythonLang);

        assert.equal(actualOutput.length, expectedOutput.length, `Array lengths are not equal: expected ${expectedOutput.length} but got ${actualOutput.length}.`);
        for (let i = 0; i < expectedOutput.length; i++) {
            assert.equal(actualOutput[i], expectedOutput[i], `Elements not the same: expected ${expectedOutput[i]} but got ${actualOutput[i]}.`);
        }
    });
});


describe('Function: Configure Lang', function () {
    it('Should determine and return the correct language of the file', function () {
        input = 'some_file.py';
        expectedOutput = '# ';

        actualOutput = parser.configureLang(input)['lang']['direct']['comment'];

        assert.equal(actualOutput, expectedOutput, `Type detected incorrectly: expected ${expectedOutput} but got ${actualOutput}.`);
    });

    it('Should determine and return the correct language of the file', function () {
        input = 'some_file.js';
        expectedOutput = '// ';

        actualOutput = parser.configureLang(input)['lang']['direct']['comment'];

        assert.equal(actualOutput, expectedOutput, `Type detected incorrectly: expected ${expectedOutput} but got ${actualOutput}.`);
    });
});


describe('Function: Form Non English Words', function () {
    it('Should form an array of non English words', function () {
        input = ['strange', 'make', 'donuts', 'strange', 'five'];
        expectedOutput = ['md', 'five'];

        actualOutput = parser.formNonEnglishWords(input);

        assert.equal(actualOutput.length, expectedOutput.length,
            `Array lengths are not equal: expected ${expectedOutput.length} but got ${actualOutput.length}.`);

        for (let i = 0; i < expectedOutput.length; i++) {
            assert.equal(actualOutput[i], expectedOutput[i],
                `elements are not equal: expected ${expectedOutput[i]} but got ${actualOutput[i]}.`)
        }
    });

    it('Should form an array of non English words', function () {
        input = ['strange', 'make', 'donuts'];
        expectedOutput = ['md'];

        actualOutput = parser.formNonEnglishWords(input);

        assert.equal(actualOutput.length, expectedOutput.length,
            `Array lengths are not equal: expected ${expectedOutput.length} but got ${actualOutput.length}.`);

        for (let i = 0; i < expectedOutput.length; i++) {
            assert.equal(actualOutput[i], expectedOutput[i],
                `elements are not equal: expected ${expectedOutput[i]} but got ${actualOutput[i]}.`)
        }
    });

    it('Should form an array of non English words', function () {
        input = ['strange', 'central', 'intelligence', 'agency', 'strange', 'six', 'strange', 'national', 'security', 'agency', 'strange'];
        expectedOutput = ['cia', 'six', 'nsa'];

        actualOutput = parser.formNonEnglishWords(input);

        assert.equal(actualOutput.length, expectedOutput.length,
            `Array lengths are not equal: expected ${expectedOutput.length} but got ${actualOutput.length}.`);

        for (let i = 0; i < expectedOutput.length; i++) {
            assert.equal(actualOutput[0], expectedOutput[0],
                `elements are not equal: expected ${expectedOutput[0]} but got ${actualOutput[0]}.`)
        }
    });
});


describe('Function: Build Filename', function () {
    it('Should build filename according to new-file command', function () {
        input = ['new-file', 'habeeby', 'ya', 'pascal', 'python'];
        expectedOutput = ['new-file', 'HabeebyYa.py'];

        actualOutput = parser.buildFileName(input);

        assert.equal(actualOutput.length, expectedOutput.length,
            `Array lengths are not equal: expected ${expectedOutput.length} but got ${actualOutput.length}.`);

        for (let i = 0; i < expectedOutput.length; i++) {
            assert.equal(actualOutput[i], expectedOutput[i],
                `elements are not equal: expected ${expectedOutput[i]} but got ${actualOutput[i]}.`)
        }
    });

    it('Should build filename according to new-file command', function () {
        input = ['new-file', 'habeeby', 'ya', 'snake', 'javascript'];
        expectedOutput = ['new-file', 'habeeby_ya.js'];

        actualOutput = parser.buildFileName(input);

        assert.equal(actualOutput.length, expectedOutput.length,
            `Array lengths are not equal: expected ${expectedOutput.length} but got ${actualOutput.length}.`);

        for (let i = 0; i < expectedOutput.length; i++) {
            assert.equal(actualOutput[i], expectedOutput[i],
                `elements are not equal: expected ${expectedOutput[i]} but got ${actualOutput[i]}.`)
        }
    });

    it('Should build filename without sending a convention', function () {
        input = ['new-file', 'habeeby', 'ya', 'javascript'];
        expectedOutput = ['new-file', 'habeebyya.js'];

        actualOutput = parser.buildFileName(input);

        assert.equal(actualOutput.length, expectedOutput.length,
            `Array lengths are not equal: expected ${expectedOutput.length} but got ${actualOutput.length}.`);

        for (let i = 0; i < expectedOutput.length; i++) {
            assert.equal(actualOutput[i], expectedOutput[i],
                `elements are not equal: expected ${expectedOutput[i]} but got ${actualOutput[i]}.`)
        }
    });
});
