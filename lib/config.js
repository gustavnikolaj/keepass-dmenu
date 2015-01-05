var _ = require('lodash');

function exitWithError() {
    console.log.apply(console, arguments);
    process.exit(1);
}

module.exports = function (argv) {
    var config = _.extend({}, require('./defaultConfig'));

    // databasePath
    if (argv.database) {
        config.databasePath = require('path').resolve(process.cwd(), argv.database);
    } else {
        exitWithError('You must provide a path to the database. Use the --database option.');
    }

    // cachePassword
    if (argv['cache-password']) {
        config.cachePassword = argv['cache-password'];
    }

    // label
    if (argv.label) {
        config.label = argv.label;
    }

    // password
    if (argv.password) {
        config.password = argv.password;
    }

    // clearClipboard
    if (typeof argv['clear-clipboard'] === 'number') {
        if (argv['clear-clipboard'] === 0) {
            config.clearClipboard = false;
        } else {
            config.clearClipboard = argv['clear-clipboard'] * 1000; // convert seconds to ms
        }
    } else if (argv['clear-clipboard'] !== undefined) {
        exitWithError('Invalid value for flag --clear-clipboard, must be a number.');
    }

    return config;
};
