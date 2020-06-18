const assert = require('assert');
const parser = require('../server/parser');
const pythonLang = require('../server/languages/python/python-lang.json');

describe('Function: Form Numbers', function () {
    it('Should convert string array of text into numbers', function () {
        input = ['one', 'two', 'three'];
        expectedOutput = 123;

        actualOutput = parser.formNumbers(input);

        assert.equal(actualOutput, expectedOutput, `Numbers are not equal: expected ${expectedOutput} but got ${actualOutput}.`);
    });

    it('Should throw error if input is not an array', function () {
        input = 'one two three';

        assert.throws(() => parser.formNumbers(input), TypeError, 'It did not throw TypeError as expected.');
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
        input = ['variable', 'my', 'new', 'variable', 'pascal', 'case', 'variable', 'my', 'new', 'variable', 'camel', 'case'];
        expectedOutput = ['MyNewVariable' ,'myNewVariable'];

        actualOutput = parser.buildVariableName(input);

        assert.equal(actualOutput.length, expectedOutput.length, 
            `Arrays lengths are different: expected ${expectedOutput.length} but got ${actualOutput.length}.`);
        
        for(var i = 0; i < expectedOutput.length; i++) {
            assert.equal(actualOutput[i], expectedOutput[i], 
                `Variable names are different: expected ${expectedOutput[i]} but got ${actualOutput[i]}.`);
        }

    });

    it('Should throw error if input is not an array', function () {
        input = 'variable my new variable snake case';

        assert.throws(() => parser.buildVariableName(input), TypeError, 'It did not throw TypeError as expected.');
    });
});

describe('Function: Process Sentence', function () {
    it('Should convert multi-word commands to one word', function () {
        input = ['else', 'if', 'bracket'];
        expectedOutput = ['else-if', 'bracket'];

        actualOutput = parser.processSentence(input, pythonLang);

        assert.equal(actualOutput.length, expectedOutput.length, `Array lengths are not equal: expected ${expectedOutput.length} but got ${actualOutput.length}.`);

        for (let i = 0; i < expectedOutput.length; i++) {
            assert.equal(actualOutput[i], expectedOutput[i], `Elements not the same: expected ${expectedOutput.length} but got ${actualOutput.length}.`);
        }
    });

    it('Should throw error if input is not an array', function () {
        input = 'some random text';

        assert.throws(() => parser.processSentence(input, pythonLang), TypeError, 'It did not throw TypeError as expected.');
    });
});
