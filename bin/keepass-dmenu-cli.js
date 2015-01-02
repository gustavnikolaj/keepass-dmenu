#!/usr/bin/env node
var argv = require('yargs')
    .usage('Usage: $0 --database path/to/db.kbdx')
    .demand(['database'])
    .argv;
var async = require('async');
var fs = require('fs');
var kpio = require('keepass.io');

var Timer = require('../lib/timer');
var parseRawDatabase = require('../lib/parseRawDatabase');
var startReaper = require('../lib/startReaper');

var databasePath = require('path').resolve(process.cwd(), argv.database);

var db = new kpio.Database();

var passwordCacheFile = '/tmp/keepass-dmenu.cache';
var passwordCacheReaperPid = '/tmp/keepass-dmenu.reaper-pid';

async.waterfall([
    // ask for the password
    function (callback) {
        // Prompt for password
        if (!argv.password) {
            if (argv['cache-password']) {
                // If cache password option is given, check for an existing password.
                var password;
                async.waterfall([
                    // read reaper pid id and kill it the reaper if it's found
                    function (callback) {
                        fs.readFile(passwordCacheReaperPid, function (err, data) {
                            if (!err) {
                                if (/^[0-9]+$/.test(data)) {
                                    return require('child_process').exec('kill -2 ' + data, function () {
                                        callback();
                                    });
                                }
                            }
                            callback();
                        });
                    },
                    // attempt to read password file
                    fs.readFile.bind(fs, passwordCacheFile),
                    function (data, callback) {
                        data = JSON.parse(data);
                        password = new kpio.Credentials.Password('temp');
                        password.__hashBuffer = new Buffer(data.buffer);
                        callback();
                    },
                    // start a new reaper
                    startReaper.bind(null, argv['cache-password']),
                    function (callback) {
                        callback(null, password);
                    }
                ], function (err, password) {
                    if (err) {
                        // found no password file, better get one
                        return require('../lib/passwordPrompt')(function (err, password) {
                            callback(err, password);
                        });
                    }
                    return callback(null, password);
                });
            } else {
                return require('../lib/passwordPrompt')(callback);
            }
        } else {
            return callback(null, argv.password);
        }
    },
    // create the password
    function (password, callback) {
        var credential;
        if (password instanceof kpio.Credentials.Password) {
            credential = password;
        } else {
            var pwTimer = new Timer({ start: true, report: true, name: 'Create Password' });
            credential = new kpio.Credentials.Password(password);
            console.log('Generated credential', credential.__hashBuffer);
            pwTimer.end();
            if (argv['cache-password']) {
                return fs.writeFile(passwordCacheFile, JSON.stringify({buffer: credential.__hashBuffer}), function (err) {
                    startReaper(argv['cache-password'], function () {
                        db.addCredential(credential);
                        callback();
                    });
                });
            }
        }
        db.addCredential(credential);
        callback();
    },
    // load the database
    function (callback) {
        var loadTimer = new Timer({ start: true, report: true, name: 'Load Database File' });
        db.loadFile(databasePath, function (err, api) {
            loadTimer.end();
            callback.apply(null, arguments);
        });
    },
    function (api, callback) {
        var database = api.getRaw();
        var parseTimer = new Timer({ start: true, report: true, name: 'Parse Database' });
        database = parseRawDatabase(database);
        parseTimer.end();
        // require('uninspected').log('foo', database);

        var flatTimer = new Timer({ start: true, report: true, name: 'Flatten' });
        var flattenedList = require('../lib/flattenedList')(database);
        flatTimer.end();

        // require('uninspected').log(flattenedList);

        callback(null, flattenedList);
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
