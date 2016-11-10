'use strict';

/**
 * Сделано задание на звездочку
 * Реализованы методы or и and
 */
exports.isStar = true;

var ORDER_OF_COMMANDS = ['filterIn', 'sortBy', 'or', 'and', 'selector', 'limit', 'format'];

exports.query = function (collection) {
    var result = collection.map(function (entry) {
        return Object.assign({}, entry);
    });

    var commands = [].slice.call(arguments, 1).sort(function (a, b) {
        return ORDER_OF_COMMANDS.indexOf(a.name) - ORDER_OF_COMMANDS.indexOf(b.name);
    });

    result = commands.reduce(function (prev, next) {
        return next(prev);
    }, result);

    return result;
};

exports.select = function select() {
    var properties = [].slice.call(arguments);

    return function selector(collection) {
        return collection.map(function (entry) {
            var result = {};

            properties.map(function (property) {
                if (entry.hasOwnProperty(property)) {
                    result[property] = entry[property];
                }

                return null;
            });

            return result;
        });
    };
};

exports.filterIn = function (property, values) {
    return function filterIn(collection) {
        return collection.filter(function (entry) {
            if (!entry.hasOwnProperty(property)) {
                return true;
            }

            return values.indexOf(entry[property]) !== -1;
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
        return collection.map(function (entry) {
            if (entry.hasOwnProperty(property)) {
                entry[property] = formatter(entry[property]);
            }

            return entry;
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
            return collection.filter(function (entry) {
                return filters.some(function (filter) {
                    return filter(collection).indexOf(entry) !== -1;
                });
            });
        };
    };

    exports.and = function () {
        var filters = [].slice.call(arguments);

        return function and(collection) {
            return collection.filter(function (entry) {
                return filters.every(function (filter) {
                    return filter(collection).indexOf(entry) !== -1;
                });
            });
        };
    };
}
