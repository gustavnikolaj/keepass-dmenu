#!/usr/bin/env node
var argv = require('yargs')
    .usage('Usage: $0 --database path/to/db.kbdx')
    .demand(['database'])
    .argv;
var async = require('async');
var config = require('../lib/config')(argv);

var defaultLabels = ['password', 'username', 'url', 'notes'];

async.waterfall([
    require('../lib/getPassword')(config),
    require('../lib/createPassword')(config),
    require('../lib/loadDatabase')(config),
    // Present choice for entries
    function (entries, callback) {
        require('../lib/dmenuFilter')(entries.map(function (entry) {
            return entry.path;
        }), function (err, choice) {
            if (err) {
                return callback(err);
            }

            var result = entries.filter(function (entry) {
                return entry.path === choice;
            });

            if (result.length === 1) {
                return callback(null, result[0]);
            } else if (result.length === 0) {
                return callback(new Error('no matching results'));
            } else {
                return callback(new Error('too many matching results'));
            }
        });
    },
    // Present choice for labels
    function (matched, callback) {
        if (config.label) {
            if (matched[argv.label]) {
                callback(null, matched[argv.label]);
            } else {
                return callback(new Error('no matching results'));
            }
        } else {
            var labels = defaultLabels.filter(function (label) {
                return label in matched;
            }).concat(Object.keys(matched).filter(function (label) {
                return defaultLabels.indexOf(label) === -1;
            }).sort());

            require('../lib/dmenuFilter')(labels, function (err, choice) {
                if (err) {
                    return callback(err);
                }

                if (matched[choice]) {
                    return callback(null, matched[choice]);
                } else {
                    return callback(new Error('no matching results'));
                }
            });
        }
    },
    // Put requested property on the clipboard
    function (matched, callback) {
        require('../lib/copyToClipboard')(matched, function (err) {
            if (err) {
                return callback(err);
            }

            console.log('put requested property on clipboard');
            callback();
        });
    },
    // Clear the clipboard
    function (callback) {
        if (config.clearClipboard) {
            setTimeout(function () {
                require('../lib/copyToClipboard')('', function (err) {
                    if (err) {
                        return callback(err);
                    }

                    console.log('cleared clipboard after 5 seconds');
                    callback();
                });
            }, config.clearClipboard);
        } else {
            callback();
        }
    }
], function (err) {
    if (err) {
        require('../lib/exitWithError')('Error: ', err);
    }
    console.log('Done!');
});
