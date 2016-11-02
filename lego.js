'use strict';

/**
 * Сделано задание на звездочку
 * Реализованы методы or и and
 */
exports.isStar = true;

var orderOfCommands = ['sortBy', 'filterIn', 'or', 'and', 'selector', 'format', 'limit'];

exports.query = function (collection) {
    var result = collection.map(function (e) {
        return Object.assign({}, e);
    });

    var commands = [].slice.call(arguments).slice(1)
    .sort(function (a, b) {
        return orderOfCommands.indexOf(a.name) - orderOfCommands.indexOf(b.name);
    });

    for (var i = 0; i < commands.length; i++) {
        result = commands[i](result);
    }

    return result;
};

exports.select = function select() {
    var properties = [].slice.call(arguments);

    return function selector(collection) {
        return collection.map(function (e) {
            var result = {};

            for (var i = 0; i < properties.length; i++) {
                var property = properties[i];

                if (!e.hasOwnProperty(property)) {
                    continue;
                }

                result[property] = e[property];
            }

            return result;
        });
    };
};

exports.filterIn = function (property, values) {
    return function filterIn(collection) {
        return collection.filter(function (e) {
            if (!e.hasOwnProperty(property)) {
                return true;
            }

            return values.indexOf(e[property]) !== -1;
        });
    };

};

exports.sortBy = function (property, order) {
    return function sortBy(collection) {
        return collection.sort(function (a, b) {
            var multiply = order === 'asc' ? 1 : -1;

            return multiply * (a[property] <= b[property] ? -1 : 1);
        });
    };
};

exports.format = function (property, formatter) {
    return function format(collection) {
        return collection.map(function (e) {
            if (e.hasOwnProperty(property)) {
                e[property] = formatter(e[property]);
            }

            return e;
        });
    };
};

exports.limit = function (count) {
    return function limit(collection) {
        return collection.slice(0, count);
    };
};

if (exports.isStar) {
    exports.or = function () {
        var filters = [].slice.call(arguments);

        return function or(collection) {
            return collection.filter(function (e) {
                for (var i = 0; i < filters.length; i++) {
                    if (filters[i](collection).indexOf(e) !== -1) {
                        return true;
                    }
                }

                return false;
            });
        };
    };

    exports.and = function () {
        var filters = [].slice.call(arguments);

        return function and(collection) {
            return collection.filter(function (e) {
                for (var i = 0; i < filters.length; i++) {
                    if (filters[i](collection).indexOf(e) === -1) {
                        return false;
                    }
                }

                return true;
            });
        };
    };
}
