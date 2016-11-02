'use strict';

/**
 * Сделано задание на звездочку
 * Реализованы методы or и and
 */
exports.isStar = false;

/**
 * Запрос к коллекции
 * @param {Array} collection
 * @params {...Function} – Функции для запроса
 * @returns {Array}
 */
exports.query = function (collection) {
    if (collection.length === 0 || arguments.length === 0) {
        return collection;
    }

    var restrictions = parseRestrictions([].slice.call(arguments).slice(1));

    if (!restrictions.fields || restrictions.fields.length === 0) return [];

    var sortedCopy = copyAndSort(collection, restrictions.sortBy);

    var result = getResult(sortedCopy, restrictions);

    return result;
};

/**
 * Выбор полей
 * @params {...String}
 */
exports.select = function select() {
    var result = {}

    result.type = 'select';
    result.fields = [].slice.call(arguments);

    return result;
};

/**

 * Фильтрация поля по массиву значений
 * @param {String} property – Свойство для фильтрации
 * @param {Array} values – Доступные значения
 */
exports.filterIn = function (property, values) {
    var result = {}

    result.type = 'filterIn';
    result.field = property;
    result.values = values;

    return result;
};

/**
 * Сортировка коллекции по полю
 * @param {String} property – Свойство для фильтрации
 * @param {String} order – Порядок сортировки (asc - по возрастанию; desc – по убыванию)
 */
exports.sortBy = function (property, order) {
    var result = {}

    result.type = 'sortBy';
    result.field = property;
    result.order = order;

    return result;
};

function satisfyFilters(object, filters) {
    for (var i = 0; i < filters.length; i++) {
        var filter = filters[i];
        var value = object[filter.field];
        if (value === undefined) continue;
        if (filter.values.indexOf(value) === -1) {
            return false;
        }
    }
    return true;
}

function parseRestrictions(restcrictions) {
    var result = {}

    result.fields = undefined;
    result.filters = [];
    result.sortBy = undefined;
    result.formats = [];
    result.limit = undefined;

    for (var i = 0; i < restcrictions.length; i++) {
        var cur = restcrictions[i];

        switch(cur.type) {
            case 'select':
                if (result.fields === undefined) {
                    result.fields = cur.fields;
                } else {
                    result.fields = fields.filter(function(e) {
                        return cur.fields.indexOf(e) !== -1;
                    });
                }
                break;

            case 'filterIn':
                result.filters.push(cur);
                break;

            case 'sortBy':
                result.sortBy = cur;
                break;

            case 'format':
                result.formats.push(cur);
                break;

            case 'limit':
                if (result.limit === undefined) {
                    result.limit = cur.limit;
                } else {
                    result.limit = Math.min(result.limit, cur.limit);
                }
                break;
        }
    }

    return result;
}

function copyAndSort(collection, sortBy) {
    var copy = [].slice.call(collection);

    if (sortBy !== undefined) {
        copy.sort(function(a, b) {
            if (sortBy.order === 'asc') {
                if (a[sortBy.field] < b[sortBy.field]) {
                    return -1;
                } else if (a[sortBy.field] > b[sortBy.field]) {
                    return 1;
                } else {
                    return 0;
                }
            } else {
                if (a[sortBy.field] > b[sortBy.field]) {
                    return -1;
                } else if (a[sortBy.field] < b[sortBy.field]) {
                    return 1;
                } else {
                    return 0;
                }
            }
        });
    }

    return copy;
}

function getResult(sortedCopy, restrictions) {
    var result = []

    for (var i = 0; i < sortedCopy.length; i++) {
        var e = sortedCopy[i];
        if (satisfyFilters(e, restrictions.filters)) {
            var cur = {};
            for (var j = 0; j < restrictions.fields.length; j++) {
                var field = restrictions.fields[j];

                if (e[field] === undefined) continue;

                cur[field] = e[field];
                for (var k = 0; k < restrictions.formats.length; k++) {
                    var format = restrictions.formats[k];
                    if (field === format.field) {
                        cur[field] = format.formatter(cur[field]);
                    }
                }
            }       
            result.push(cur);
        }
        if (restrictions.limit && result.length === restrictions.limit) break;      
    }

    return result;
}

/**
 * Форматирование поля
 * @param {String} property – Свойство для фильтрации
 * @param {Function} formatter – Функция для форматирования
 */
exports.format = function (property, formatter) {
    var result = {}

    result.type = 'format';
    result.field = property;
    result.formatter = formatter;

    return result;
};

/**
 * Ограничение количества элементов в коллекции
 * @param {Number} count – Максимальное количество элементов
 */
exports.limit = function (count) {
    var result = {}

    result.type = 'limit';
    result.count = count;

    return result;
};

if (exports.isStar) {

    /**
     * Фильтрация, объединяющая фильтрующие функции
     * @star
     * @params {...Function} – Фильтрующие функции
     */
    exports.or = function () {
        return;
    };

    /**
     * Фильтрация, пересекающая фильтрующие функции
     * @star
     * @params {...Function} – Фильтрующие функции
     */
    exports.and = function () {
        return;
    };
}
