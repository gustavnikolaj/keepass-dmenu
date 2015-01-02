var expect = require('unexpected');
var fs = require('fs');
var passError = require('passerror');
var parseRawDatabase = require('../../lib/parseRawDatabase');


function getTestFile(filename) {
    var testDataPath = require('path').resolve(__dirname, '..', '..', 'testdata', 'rawDatabaseInJsonFormat');
    var content = fs.readFileSync(testDataPath + '/' + filename, 'utf-8');
    content = content.replace(/^\/\/.*?\n/gm, ''); // Strip comments
    return content;
}


describe('lib/parseRawDatabase', function () {
    it('should be able to pass groups both singular and multiple', function () {
        var data = JSON.parse(getTestFile('groups.json'));
        expect(function () {
            parseRawDatabase(data);
        }, 'not to throw');
    });
    it('should be able to pass entries both singular and multiple', function () {
        var data = JSON.parse(getTestFile('entries.json'));
        expect(function () {
            parseRawDatabase(data);
        }, 'not to throw');
    });
});
