var fs = require('fs');
var path = require('path');

function log() {
    var args = [(new Date()).toUTCString()].concat(Array.prototype.slice.call(arguments));
    console.log.apply(console, args);
}

var timeout = process.argv.pop();

if (!(/^[0-9]+$/.test(timeout))) {
    log('invalid timeout, exiting!', timeout, process.argv);
    process.exit(1);
}

timeout = timeout * 1000; // convert seconds to milliseconds

log('starting reaper.js');

var passwordCacheFile = '/tmp/keepass-dmenu.cache';
var passwordCacheReaperPid = '/tmp/keepass-dmenu.reaper-pid';

fs.writeFile(passwordCacheReaperPid, process.pid, function (err) {
    if (err) {
        log('reaper.js got error:', err);
        process.exit(1);
    }

    setTimeout(function () {
        fs.unlink(passwordCacheFile, function () {
            log('reaped cache file');
            fs.unlink(passwordCacheReaperPid, function () {
                log('reaped pid file');
                log('exiting');
                process.exit(0);
            });
        });
    }, timeout);
});


process.on('SIGTERM', function () {
    log('reaper.js got SIGTERM');
    fs.unlink(passwordCacheFile, function () {
        log('reaped cache file');
        fs.unlink(passwordCacheReaperPid, function () {
            log('reaped pid file');
            log('reaper.js cleaned up files exiting');
            process.exit(0);
        });
    });
});

process.on('SIGINT', function () {
    log('child.js got SIGINT');
    fs.unlink(passwordCacheReaperPid, function () {
        log('child.js cleaned up pid file');
        process.exit(0);
    });
});
