var Timer = require('./timer');
var kpio = require('keepass.io');
var passError = require('passerror');

module.exports = function (config) {
    return function loadDatabase(credential, callback) {
        var db = new kpio.Database();
        db.addCredential(credential);
        if (config.keyfile) {
            var keyFileCred = new kpio.Credentials.Keyfile(config.keyfile)
            db.addCredential(keyFileCred);
        }

        var loadTimer = new Timer({ start: true, report: true, name: 'Load Database File' });
        db.loadFile(config.databasePath, passError(callback, function (api) {
            loadTimer.end();
            var data = api.getRaw();

            data = require('./parseRawDatabase')(data);
            data = require('./flattenedList')(data);
            require('./flagUniqueEntries')(data);

            callback(null, data);
        }));
    };
};
