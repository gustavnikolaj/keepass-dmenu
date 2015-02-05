var fs = require('fs');

module.exports = function (config, err) {
    if (err && err.message.match(/^Could not decrypt database. /)) {
        return fs.unlinkSync(config.passwordCacheFile);
    }
};
