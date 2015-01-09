

module.exports = function flattenedList(database, path) {
    var entries = [];

    if (database.entries) {
        database.entries.forEach(function (entry) {
            entry.meta = {
                path: path
            };
            entries.push(entry);
        });
    }

    if (database.groups) {
        database.groups.map(function (group) {
            return flattenedList(group, (path ? path + '/' + group.name : group.name));
        }).forEach(function (group) {
            entries = entries.concat(group);
        });
    }

    return entries;
};
