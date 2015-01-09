

module.exports = function flattenedList(database, path) {
    path = path ? path + '/' : '';
    var entries = [];

    if (database.entries) {
        database.entries.forEach(function (entry) {
            entry.path = path + entry.title;
            entries.push(entry);
        });
    }

    if (database.groups) {
        database.groups.map(function (group) {
            return flattenedList(group, path + group.name);
        }).forEach(function (group) {
            entries = entries.concat(group);
        });
    }

    return entries;
};
