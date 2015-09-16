var _ = require('lodash');
var exitWithError = require('./exitWithError');

module.exports = function (argv) {
    var config = _.extend({}, require('./defaultConfig'));

    console.log(argv)

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
        config.password = '' + argv.password;
    }

    if (argv.keyfile) {
        config.keyfile = require('path').resolve(process.cwd(), argv.keyfile);
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

    // dmenu options
    config.dmenuOptions = {};

    // Propagate dmenu styling options through.
    // --fn font
    //       defines the font or font set used. eg. "fixed" or "Monospace-12:normal" (an xft font)
    // --nb color
    //       defines the normal background color.  #RGB, #RRGGBB, and X color names are supported.
    // --nf color
    //       defines the normal foreground color.
    // --sb color
    //       defines the selected background color.
    // --sf color
    //       defines the selected foreground color.

    ['fn', 'nb', 'nf', 'sb', 'sf'].forEach(function (flag) {
        if (flag in argv) {
            config.dmenuOptions[flag] = argv[flag];
        }
    });

    return config;
};
