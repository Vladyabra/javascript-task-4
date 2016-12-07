'use strict';

/**
 * Сделано задание на звездочку
 * Реализованы методы or и and
 */
exports.isStar = true;

var ORDER_OF_COMMANDS = ['filterIn', 'sortBy', 'or', 'and', 'select', 'limit', 'format']
.reduce(function (collection, name, i) {
    collection[name] = i;

    return collection;
}, {});

/**
 * Запрос к коллекции
 * @param {Array} collection
 * @params {...Function} – Функции для запроса
 * @returns {Array}
 */
exports.query = function (collection) {
    var collectionCopy = collection.map(function (entry) {
        return copyCollection(entry, Object.keys(entry));
    });

    var commands = [].slice.call(arguments, 1).sort(function (a, b) {
        return ORDER_OF_COMMANDS[a.name] - ORDER_OF_COMMANDS[b.name];
    });

    return commands.reduce(function (curCollection, command) {
        return command(curCollection);
    }, collectionCopy);
};

/**
 * Копирование полей объекта
 * @param {Object} collection
 * @param {Array} fields
 * @returns {Object}
 */
function copyCollection(collection, fields) {
    return fields.reduce(function (copy, field) {
        if (collection.hasOwnProperty(field)) {
            copy[field] = collection[field];
        }

        return copy;
    }, {});
}

/**
 * Выбор полей
 * @params {...String}
 * @returns {Function}
 */
exports.select = function () {
    var properties = [].slice.call(arguments);

    return function select(collection) {
        return collection.map(function (entry) {
            return copyCollection(entry, properties);
        });
    };
};

/**
 * Фильтрация поля по массиву значений
 * @param {String} property – Свойство для фильтрации
 * @param {Array} values – Доступные значения
 * @returns {Function}
 */
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

/**
 * Сортировка коллекции по полю
 * @param {String} property – Свойство для фильтрации
 * @param {String} order – Порядок сортировки (asc - по возрастанию; desc – по убыванию)
 * @returns {Function}
 */
exports.sortBy = function (property, order) {
    return function sortBy(collection) {
        return collection.sort(function (a, b) {
            var multiply = order === 'asc' ? 1 : -1;

            return multiply * (a[property] <= b[property] ? -1 : 1);
        });
    };
};

/**
 * Форматирование поля
 * @param {String} property – Свойство для фильтрации
 * @param {Function} formatter – Функция для форматирования
 * @returns {Function}
 */
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

/**
 * Ограничение количества элементов в коллекции
 * @param {Number} count – Максимальное количество элементов
 * @returns {Function}
 */
exports.limit = function (count) {
    return function limit(collection) {
        return collection.slice(0, count);
    };
};

if (exports.isStar) {

    /**
     * Фильтрация, объединяющая фильтрующие функции
     * @star
     * @params {...Function} – Фильтрующие функции
     * @returns {Function}
     */
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

    /**
     * Фильтрация, пересекающая фильтрующие функции
     * @star
     * @params {...Function} – Фильтрующие функции
     * @returns {Function}
     */
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
