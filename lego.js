'use strict';

/**
 * Сделано задание на звездочку
 * Реализованы методы or и and
 */
exports.isStar = false;

exports.query = function (collection) {
    if (collection.length === 0 || arguments.length === 1) {
        return collection;
    }

    var restrictions = parseRestrictions([].slice.call(arguments).slice(1));

    if (!restrictions.fields || restrictions.fields.length === 0 ||
        restrictions.limit !== undefined && restrictions.limit === 0) {
        return [];
    }

    var sortedCopy = copyAndSort(collection, restrictions.sortBy);

    var result = getResult(sortedCopy, restrictions);

    return result;
};

exports.select = function select() {
    var result = {};

    result.type = 'select';
    result.fields = [].slice.call(arguments);

    return result;
};

exports.filterIn = function (property, values) {
    var result = {};

    result.type = 'filterIn';
    result.field = property;
    result.values = values;

    return result;
};

exports.sortBy = function (property, order) {
    var result = {};

    result.type = 'sortBy';
    result.field = property;
    result.order = order;

    return result;
};

function satisfyFilters(object, filters) {
    for (var i = 0; i < filters.length; i++) {
        var filter = filters[i];
        var value = object[filter.field];

        if (value === undefined) {
            return false;
        }

        if (filter.values.indexOf(value) === -1) {
            return false;
        }
    }

    return true;
}

function parseRestrictions(restcrictions) {
    var result = {};

    result.fields = undefined;
    result.filters = [];
    result.sortBy = undefined;
    result.formats = [];
    result.limit = undefined;

    for (var i = 0; i < restcrictions.length; i++) {
        applyRestriction(result, restcrictions[i]);
    }

    return result;
}

function applyRestriction(restrictions, cur) {
    switch (cur.type) {
        case 'select':
            applySelect(restrictions, cur);
            break;

        case 'filterIn':
            restrictions.filters.push(cur);
            break;

        case 'sortBy':
            restrictions.sortBy = cur;
            break;

        case 'format':
            restrictions.formats.push(cur);
            break;

        case 'limit':
            applyLimit(restrictions, cur);
            break;

        default:
            break;
    }
}

function applyLimit(restrictions, cur) {
    if (restrictions.limit === undefined) {
        restrictions.limit = cur.count;
    } else {
        restrictions.limit = Math.min(restrictions.limit, cur.count);
    }
}

function applySelect(restrictions, cur) {
    if (restrictions.fields === undefined) {
        restrictions.fields = cur.fields;
    } else {
        restrictions.fields = restrictions.fields.filter(function (e) {
            return cur.fields.indexOf(e) !== -1;
        });
    }
}

function copyAndSort(collection, sortBy) {
    var copy = [].slice.call(collection);

    if (sortBy !== undefined) {
        copy.sort(function (a, b) {
            var multiply = sortBy.order === 'asc' ? 1 : -1;

            if (a[sortBy.field] === b[sortBy.field]) {
                return multiply * (collection.indexOf(a) - collection.indexOf(b));
            }

            return multiply * (a[sortBy.field] < b[sortBy.field] ? -1 : 1);
        });
    }

    return copy;
}

function getResult(sortedCopy, restrictions) {
    var result = [];

    for (var i = 0; i < sortedCopy.length; i++) {
        var e = sortedCopy[i];

        if (!satisfyFilters(e, restrictions.filters)) {
            continue;
        }

        result.push(getFormattedObject(e, restrictions));

        if (restrictions.limit !== undefined && result.length === restrictions.limit) {
            break;
        }
    }

    return result;
}

function getFormattedObject(e, restrictions) {
    var cur = {};
    for (var j = 0; j < restrictions.fields.length; j++) {
        var field = restrictions.fields[j];

//        if (e[field] === undefined) {
//            continue;
//        }

        cur[field] = formatValue(field, e[field], restrictions);
    }

    return cur;
}

function formatValue(field, value, restrictions) {
    for (var k = 0; k < restrictions.formats.length; k++) {
        var format = restrictions.formats[k];
        if (field === format.field) {
            value = format.formatter(value);
        }
    }

    return value;
}

exports.format = function (property, formatter) {
    var result = {};

    result.type = 'format';
    result.field = property;
    result.formatter = formatter;

    return result;
};

exports.limit = function (count) {
    var result = {};

    result.type = 'limit';
    result.count = count;

    return result;
};

if (exports.isStar) {
    exports.or = function () {
        return;
    };

    exports.and = function () {
        return;
    };
}
