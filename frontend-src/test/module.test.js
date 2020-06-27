const assert = require('assert');
const fs = require('fs');

beforeEach('Prepareing test case', function () {
    fs.openSync('test/temp_test_file.py', 'w')
});

after(function () {
    fs.unlinkSync('test/temp_test_file.py');
});

describe('Function: Function Name', function () {
    it('Should do something', function () {
        assert.equal([1, 2, 3].indexOf(4), -1);
    });
});
