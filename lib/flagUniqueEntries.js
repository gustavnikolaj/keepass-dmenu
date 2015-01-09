module.exports = function flagUniqueEntries(entries) {
    var titles = entries.reduce(function (result, entry) {
        result[entry.title] = result[entry.title] || 0;
        result[entry.title] += 1;
        return result;
    }, {});

    entries.forEach(function (entry) {
        entry.meta.unique = titles[entry.title] === 1;
    });
};
