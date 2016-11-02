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

    var fields = null;
    var filters = [];
    var sortBy = null;
    var formats = [];
    var limit = null;

    for (var i = 1; i < arguments.length; i++) {
        var cur = arguments[i];
        if (!cur) continue;
        switch(cur.type) {
            case 'select':
                if (!fields) {
                    fields = cur.fields;
                } else {
                    fields = fields.filter(function(e) {
                        return cur.fields.indexOf(e) !== -1;
                    });
                }
                break;

            case 'filterIn':
                filters.push(cur);
                break;

            case 'sortBy':
                sortBy = cur;
                break;

            case 'format':
                formats.push(cur);
                break;

            case 'limit':
                if (!limit) {
                    limit = cur.limit;
                } else {
                    limit = Math.min(limit, cur.limit);
                }
                break;
        }
    }

    if (!fields || fields.length === 0) return [];

    collection = [].slice.call(collection);
    if (sortBy) {
        collection.sort(function(a, b) {
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

    var result = [];

    for (var e of collection) {
        if (satisfyFilters(e, filters)) {
            var cur = {};
            for (var field of fields) {
                if (e[field] === undefined) continue;

                cur[field] = e[field];
                for (var format of formats) {
                    if (field === format.field) {
                        cur[field] = format.formatter(cur[field]);
                    }
                }
            }       
            result.push(cur);
        }
        if (limit && result.length == limit) break;      
    }

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
    for (var filter of filters) {
        var value = object[filter.field];
        if (value === undefined) continue;
        if (filter.values.indexOf(value) == -1) {
            return false;
        }
    }
    return true;
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
