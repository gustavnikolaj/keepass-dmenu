var exec = require('child_process').exec;
var _ = require('lodash');

module.exports = function passwordPrompt(config, callback) {
    var dmenuOpts = _.extend({}, config.dmenuOptions);

    // Make sure that the password prompt text is the same color as
    // the background.
    if (dmenuOpts.nb) {
        dmenuOpts.nf = dmenuOpts.nb;
    } else {
        dmenuOpts.nb = 'black';
        dmenuOpts.nf = 'black';
    }

    var dmenuArgs = Object.keys(dmenuOpts).map(function (flag) {
        return '-' + flag + ' "' + dmenuOpts[flag] + '"';
    }).join(' ');

    var cmd = 'echo | dmenu -p "Password:" ' + dmenuArgs;
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
