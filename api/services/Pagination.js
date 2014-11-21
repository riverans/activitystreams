/*jslint node: true */
'use strict';

module.exports = {
    /**
     * Given a query and an array of items, returns a subset of those items
     * matching the limit and the offset given in the query.
     * @param query
     *    can contain
     *        - 'limit': the number of results per page
     *        - 'offset': the page
     * @param items
     *    can be either an Array
     *    or an Object where its keys are numbers: '1', '2', ...
     * @returns {*}
     */
    paginate: function(query, items){
        var limit=('limit' in query) ? Number(query.limit) : 50,
            offset=('offset' in query) ? Number(query.offset) : 1,
            reduced={},
            init = (offset-1) * limit,
            end = init + limit,
            key;

        if(items instanceof Array){
            return items.slice(init, end);
        }

        for (var i = init; i < end; i++) {
            key = i.toString();
            if(key in items){
                reduced[key] = items[key]
            }
        };

        return reduced;
    }
};