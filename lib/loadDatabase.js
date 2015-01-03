var Timer = require('./timer');
var kpio = require('keepass.io');
var passError = require('passerror');

module.exports = function (config) {
    return function loadDatabase(credential, callback) {
        var db = new kpio.Database();
        db.addCredential(credential);

        var loadTimer = new Timer({ start: true, report: true, name: 'Load Database File' });
        db.loadFile(config.databasePath, passError(callback, function (api) {
            loadTimer.end();
            var data = api.getRaw();

            data = require('./parseRawDatabase')(data);
            data = require('./flattenedList')(data);

            callback(null, data);
        }));
    };
};
