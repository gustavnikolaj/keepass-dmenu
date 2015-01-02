
function databaseWalker(node) {
    var result = {};

    result.uuid = node.UUID;

    if (node.Name) {
        result.name = node.Name;
    }

    if (node.Entry) {
        var entry = node.Entry;
        if (!Array.isArray(entry)) { entry = [entry]; }
        result.entries = entry.map(databaseWalker);
    }

    if (node.Group) {
        var group = node.Group;
        if (!Array.isArray(group)) { group = [group]; }
        result.groups = group.map(databaseWalker);
    }

    if (node.String) {
        node.String.forEach(function (item) {
            var key = item.Key.toLowerCase();
            if (key === 'password') {
                result[key] = item.Value._;
            } else {
                result[key] = item.Value;
            }
        });
    }

    return result;
}

module.exports = function parseRawDatabase(rawDatabase) {
    rawDatabase = rawDatabase.KeePassFile.Root.Group;
    return databaseWalker(rawDatabase);
};
