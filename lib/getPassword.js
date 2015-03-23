var fs = require('fs');
var kpio = require('keepass.io');
var async = require('async');
var exec = require('child_process').exec;
var startReaper = require('./startReaper');

// ask for the password
module.exports = function (config) {
    return function getPassword(callback) {
        // Prompt for password
        if (!config.password) {
            if (config.cachePassword) {
                // If cache password option is given, check for an existing password.
                var password;
                async.waterfall([
                    // read reaper pid id and kill it the reaper if it's found
                    function (callback) {
                        fs.readFile(config.passwordCacheReaperPid, function (err, data) {
                            if (!err) {
                                if (/^[0-9]+$/.test(data)) {
                                    return exec('kill -2 ' + data, function () {
                                        callback();
                                    });
                                }
                            }
                            callback();
                        });
                    },
                    // attempt to read password file
                    fs.readFile.bind(fs, config.passwordCacheFile),
                    function (data, callback) {
                        data = JSON.parse(data);
                        password = new kpio.Credentials.Password('temp');
                        password.__hashBuffer = new Buffer(data.buffer);
                        callback();
                    },
                    // start a new reaper
                    startReaper.bind(null, config.cachePassword),
                    function (callback) {
                        callback(null, password);
                    }
                ], function (err, password) {
                    if (err) {
                        // found no password file, better get one
                        return require('./passwordPrompt')(config, function (err, password) {
                            callback(err, password);
                        });
                    }
                    return callback(null, password);
                });
            } else {
                return require('./passwordPrompt')(config, callback);
            }
        } else {
            return callback(null, config.password);
        }
    }
};
