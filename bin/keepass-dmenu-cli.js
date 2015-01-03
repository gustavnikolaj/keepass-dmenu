#!/usr/bin/env node
var argv = require('yargs')
    .usage('Usage: $0 --database path/to/db.kbdx')
    .demand(['database'])
    .argv;
var async = require('async');
var fs = require('fs');
var kpio = require('keepass.io');

var Timer = require('../lib/timer');
var startReaper = require('../lib/startReaper');

var databasePath = require('path').resolve(process.cwd(), argv.database);

var db = new kpio.Database();

var config = {
    passwordCacheFile: '/tmp/keepass-dmenu.cache',
    passwordCacheReaperPid: '/tmp/keepass-dmenu.reaper-pid'
};

var passwordCacheFile = config.passwordCacheFile;
var passwordCacheReaperPid = config.passwordCacheReaperPid;

async.waterfall([
    require('../lib/getPassword')(argv, config),
    require('../lib/createPassword')(argv, config),
    // load the database
    function (credential, callback) {
        db.addCredential(credential);
        var loadTimer = new Timer({ start: true, report: true, name: 'Load Database File' });
        db.loadFile(databasePath, function (err, api) {
            loadTimer.end();
            callback.apply(null, arguments);
        });
    },
    function (api, callback) {
        var data = api.getRaw();
        data = require('../lib/parseRawDatabase')(data);
        data = require('../lib/flattenedList')(data);

        callback(null, data);
    },
    // Present choice for entries
    function (entries, callback) {
        var dmenu = require('child_process').spawn('dmenu', ['-i']);

        var titles = entries.map(function (entry) {
            return entry.title;
        }).join('\n');

        var choice = null;
        dmenu.stdout.on('data', function (data) {
            choice = data;
        });
        dmenu.on('close', function (code) {
            if (code !== 0) {
                return callback(new Error('dmenu closed with a non-zero exit code'));
            }
            if (choice === null) {
                return callback(new Error('dmenu did not send any data'));
            }

            choice = choice.toString().replace(/\n$/, '');

            var result = entries.filter(function (entry) {
                return entry.title === choice;
            });

            if (result.length === 1) {
                return callback(null, result[0]);
            } else if (result.length === 0) {
                return callback(new Error('no matching results'));
            } else {
                return callback(new Error('too many matching results'));
            }
        });

        dmenu.stdin.setEncoding = 'utf-8';
        dmenu.stdin.write(titles);
        dmenu.stdin.end();
    },
    // Present choice for entries
    function (matched, callback) {
        if (!argv.label) {
            var dmenu = require('child_process').spawn('dmenu', ['-i']);

            var labels = Object.keys(matched).join('\n');

            var choice = null;
            dmenu.stdout.on('data', function (data) {
                choice = data;
            });
            dmenu.on('close', function (code) {
                if (code !== 0) {
                    return callback(new Error('dmenu closed with a non-zero exit code'));
                }
                if (choice === null) {
                    return callback(new Error('dmenu did not send any data'));
                }

                choice = choice.toString().replace(/\n$/, '');

                result = matched[choice] || false;

                if (result) {
                    return callback(null, result);
                } else {
                    return callback(new Error('no matching results'));
                }
            });

            dmenu.stdin.setEncoding = 'utf-8';
            dmenu.stdin.write(labels);
            dmenu.stdin.end();
        } else {
            if (matched[argv.label]) {
                callback(null, matched[argv.label]);
            } else {
                return callback(new Error('no matching results'));
            }
        }
    },
    // Put requested property on the clipboard
    function (matched, callback) {
        var xsel = require('child_process').spawn('xsel', ['-ib']);

        xsel.on('close', function (code, signal) {
            if (code !== 0) {
                return callback(new Error('xsel closed with a non-zero exit code'));
            }
            console.log('put requested property on clipboard');
            callback();
        });

        xsel.stdin.setEncoding("utf8");
        xsel.stdin.end(matched);
    },
    // Clear the clipboard
    function (callback) {
        setTimeout(function () {
            var xsel = require('child_process').spawn('xsel', ['-ib']);
            xsel.on('close', function (code, signal) {
                console.log('cleared clipboard after 5 seconds');
                if (code !== 0) {
                    return callback(new Error('xsel closed with a non-zero exit code'));
                }
                callback();
            });

            xsel.stdin.end('');
        }, 5000);
    }
], function (err) {
    if (err) {
        console.log('Error: ', err);
        process.exit(1);
    }
    console.log('Done!');
});
