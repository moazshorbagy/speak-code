const assert = require('assert');
const parser = require('../server/parser');
const pythonLang = require('../server/languages/python/python-lang.json');

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
        input = ['variable', 'my', 'new', 'variable', 'camel', 'case'];
        expectedOutput = 'myNewVariable';

        actualOutput = parser.buildVariableName(input);

        assert.equal(actualOutput, expectedOutput, `Variable names are different: expected ${expectedOutput} but got ${actualOutput}.`);
    });

    it('Should convert string array to snake-case variable name', function () {
        input = ['variable', 'my', 'new', 'variable', 'snake', 'case'];
        expectedOutput = 'my_new_variable';

        actualOutput = parser.buildVariableName(input);

        assert.equal(actualOutput, expectedOutput, `Variable names are different: expected ${expectedOutput} but got ${actualOutput}.`);
    });

    it('Should convert string array to pascal-case variable name', function () {
        input = ['variable', 'my', 'new', 'variable', 'pascal', 'case'];
        expectedOutput = 'MyNewVariable';

        actualOutput = parser.buildVariableName(input);

        assert.equal(actualOutput, expectedOutput, `Variable names are different: expected ${expectedOutput} but got ${actualOutput}.`);
    });

    it('Should convert two variable names', function () {
        input = ['if', 'variable', 'my', 'new', 'variable', 'pascal', 'case', 'equals', 'variable', 'my', 'new', 'variable', 'camel', 'case', 'plus'];
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
        input = 'variable my new variable snake case';

        assert.throws(() => parser.buildVariableName(input), TypeError, 'It did not throw TypeError as expected.');
    });

    it('Should throw error if parameters are missing', function () {
        assert.throws(() => parser.buildVariableName(), Error, 'It did not throw Error as expected.');
    });
});


describe('Function: Process Sentence', function () {
    it('Should convert multi-word commands to one word', function () {
        input = ['else', 'if', 'bracket'];
        expectedOutput = ['else-if', 'bracket'];

        actualOutput = parser.processSentence(input, pythonLang);

        assert.equal(actualOutput.length, expectedOutput.length, `Array lengths are not equal: expected ${expectedOutput.length} but got ${actualOutput.length}.`);

        for (let i = 0; i < expectedOutput.length; i++) {
            assert.equal(actualOutput[i], expectedOutput[i], `Elements not the same: expected ${expectedOutput[i]} but got ${actualOutput[i]}.`);
        }
    });

    it('Should throw error if input is not an array', function () {
        input = 'some random text';

        assert.throws(() => parser.processSentence(input, pythonLang), TypeError, 'It did not throw TypeError as expected.');
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


describe('Function: Preprocessing', function () {
    it('Should perform preprocessing correctly', function () {
        input = 'else if one three equals three one';
        expectedOutput = ['else-if', '13', 'equals', '31'];

        actualOutput = parser.preprocessing(input, pythonLang);
        
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
