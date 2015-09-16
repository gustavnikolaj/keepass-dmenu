
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
        if (Array.isArray(node.String)) {
            node.String.forEach(function (item) {
                var key = item.Key.toLowerCase();
                if (key === 'password') {
                    result[key] = item.Value._;
                } else {
                    result[key] = item.Value;
                }
            });
        } else if (node.String && typeof node.String === 'object') {
            // String is an object and not null
            // attempt at solving issue #12 - assuming that the weird thing
            // we run into, which is not a list of "String" objects, is now
            // just a "String object"
            var item = node.String;
            var key = item.Key.toLowerCase();
            if (key === 'password') {
                result[key] = item.Value._;
            } else {
                result[key] = item.Value;
            }
        }
    }

    return result;
}

module.exports = function parseRawDatabase(rawDatabase) {
    rawDatabase = rawDatabase.KeePassFile.Root.Group;
    return databaseWalker(rawDatabase);
};
