var spawn = require('child_process').spawn;

module.exports = function copyToClipboard(string, callback) {
    var xsel = spawn('xsel', ['-ib']);

    xsel.on('close', function (code) {
        if (code !== 0) {
            return callback(new Error('xsel closed with a non-zero exit code'));
        }
        callback();
    });

    xsel.stdin.setEncoding("utf8");
    xsel.stdin.end(string);
};
