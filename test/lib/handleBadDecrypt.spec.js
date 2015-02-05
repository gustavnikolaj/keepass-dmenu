var deepExtend = require('deep-extend');
var proxyquire = require('proxyquire');
var sinon = require('sinon');
var expect = require('unexpected')
    .installPlugin(require('unexpected-sinon'));

var defaultMocks = {
    fs: {
        unlinkSync: function () {}
    }
};

function handleBadDecryptFactory(mocks) {
    mocks = mocks || {};
    mocks = deepExtend(defaultMocks, mocks);
    return proxyquire('../../lib/handleBadDecrypt', mocks);
}

var config = {
    passwordCacheFile: '/tmp/foobar'
};

describe('lib/handleBadDecrypt', function () {
    it('should be a function', function () {
        var handleBadDecrypt = handleBadDecryptFactory();
        expect(handleBadDecrypt, 'to be a function');
    });
    it('should not remove the cached password file if not a decrypt error', function () {
        var mocks = {
            fs: {
                unlinkSync: sinon.spy()
            }
        };
        var handleBadDecrypt = handleBadDecryptFactory(mocks);

        handleBadDecrypt(config, new Error('foo'));

        expect(mocks.fs.unlinkSync, 'was not called');
    });

    it('should remove the cahed password if it is a decrypt error', function () {
        var mocks = {
            fs: {
                unlinkSync: sinon.spy()
            }
        };
        var handleBadDecrypt = handleBadDecryptFactory(mocks);

        handleBadDecrypt(config, new Error(
            'Could not decrypt database. ' +
            'Either the credentials were invalid or the database is corrupt.'
        ));

        expect(mocks.fs.unlinkSync, 'was called once');
    });
});
