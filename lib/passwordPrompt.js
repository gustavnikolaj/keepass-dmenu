var exec = require('child_process').exec;

module.exports = function passwordPrompt(callback) {
    var cmd = 'echo | dmenu -p "Password:" -nb black -nf black';
    return exec(cmd, function (err, stdout, stderr) {
        if (err) {
            return callback(err);
        } else if (stderr) {
            return callback(stderr);
        }

        var password = stdout.replace(/\n$/, '');
        return callback(null, password);
    });
};
