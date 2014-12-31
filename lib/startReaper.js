var path = require('path');
var fs = require('fs');
var spawn = require('child_process').spawn;

module.exports = function startReaper(timeout, callback) {
    var log = fs.openSync(path.resolve(__dirname, '..', 'child.log'), 'a');
    var child = spawn('node', [path.resolve(__dirname, 'reaper.js'), timeout], {
        detached: true,
        stdio: [ 'ignore', log, log ]
    });
    child.unref();
    callback();
};
