/*jslint node: true */
'use strict';

/**
 * Given a query and an array of items, returns a subset of those items
 * matching the limit and the page given in the query.
 * @param {object} query - with keys 'limit' and 'page'
 * @param {(array|object)} items - an Array of items or an object where keys are numbers '1', '2', ...
 * @returns {(array|object)}
 */
module.exports = function(query, items) {
    var limit=('limit' in query) ? Number(query.limit) : 50,
        page=('page' in query) ? Number(query.page) : 1,
        reduced={},
        init = (page-1) * limit,
        end = init + limit,
        key;

    if (items instanceof Array) {
        return items.slice(init, end);
    }

    for (var i = init; i < end; i++) {
        key = i.toString();
        if (key in items) {
            reduced[key] = items[key];
        }
    }

    return reduced;
}