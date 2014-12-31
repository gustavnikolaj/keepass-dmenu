

module.exports = function flattenedList(database) {
    var entries = [];

    if (database.entries) {
        database.entries.forEach(function (entry) {
            entries.push(entry);
        });
    }

    if (database.groups) {
        database.groups.map(flattenedList).forEach(function (group) {
            entries = entries.concat(group);
        });
    }

    return entries;
};
