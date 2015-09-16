var expect = require('unexpected');
var configResolver = require('../../lib/config')
var yargs = require('yargs');

function getArgv(str) {
    return yargs.parse(str.split(' '));
}

describe('lib/config', function () {
    it('should be able to parse a password only consisting of numbers', function () {
        var config = configResolver(getArgv('--database foo.ḱdbx --password 123456'))
        return expect(config, 'to satisfy', {
            password: '123456'
        });
    });
});
