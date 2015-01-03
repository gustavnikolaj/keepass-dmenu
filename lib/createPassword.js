var fs = require('fs');
var kpio = require('keepass.io');
var startReaper = require('./startReaper');

// create the password
module.exports = function (argv, config) {
    return function createPassword(password, callback) {
        var credential;
        if (password instanceof kpio.Credentials.Password) {
            credential = password;
        } else {
            credential = new kpio.Credentials.Password(password);
            if (argv['cache-password']) {
                return fs.writeFile(config.passwordCacheFile, JSON.stringify({buffer: credential.__hashBuffer}), function (err) {
                    startReaper(argv['cache-password'], function () {
                        callback(null, credential);
                    });
                });
            }
        }
        callback(null, credential);
    };
};
