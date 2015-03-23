var spawn = require('child_process').spawn;

/**
 * dmenuFilter
 *
 * Takes a list of choices and a callback. The callback will be called
 * with the selected option The callback will be called with the
 * selected option.
 *
 * Beware that dmenu allows for arbitrary input. You can get anything
 * back. This might be useful in some situations so I'm not doing any
 * validation of the result from dmenu, that is up to the user to do.
 */

module.exports = function (config, choices, callback) {
    var choice = null;

    var dmenuOpts = config.dmenuOptions;
    var dmenuArgs = Object.keys(dmenuOpts).map(function (flag) {
        return ['-' + flag, dmenuOpts[flag]];
    }).reduce(function (curr, next) {
        return curr.concat(next);
    }, []);

    var dmenu = spawn('dmenu', ['-i'].concat(dmenuArgs));

    dmenu.stdout.on('data', function (data) {
        choice = data;
    });

    var error = '';
    dmenu.stderr.on('data', function (data) {
        error += data.toString();
    });

    dmenu.on('close', function (code) {
        if (code !== 0) {
            return callback(new Error('dmenu closed with a non-zero exit code: ' + code + '\n\n' + error));
        } else if (choice === null) {
            return callback(new Error('dmenu did not send any data'));
        } else {
            choice = choice.toString().replace(/\n$/, '');
            return callback(null, choice);
        }
    });

    dmenu.stdin.setEncoding = 'utf-8';
    dmenu.stdin.write(choices.join('\n'));
    dmenu.stdin.end();
};
