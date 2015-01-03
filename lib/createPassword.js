var fs = require('fs');
var kpio = require('keepass.io');
var startReaper = require('./startReaper');

// create the password
module.exports = function (config) {
    return function createPassword(password, callback) {
        var credential;
        if (password instanceof kpio.Credentials.Password) {
            credential = password;
        } else {
            credential = new kpio.Credentials.Password(password);
            if (config.cachePassword) {
                return fs.writeFile(config.passwordCacheFile, JSON.stringify({buffer: credential.__hashBuffer}), function (err) {
                    startReaper(config.cachePassword, function () {
                        callback(null, credential);
                    });
                });
            }
        }
        callback(null, credential);
    };
};
