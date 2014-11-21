/*jslint node: true */
'use strict';

module.exports = {
    paginate: function(query, items){
        var limit=('limit' in query) ? Number(query.limit) : 50,
            offset=('offset' in query) ? Number(query.offset) : 1,
            reduced={},
            init = (offset-1) * limit,
            end = init + limit,
            key;

        for (var i = init; i < end; i++) {
            key = i.toString();
            if(key in items){
                reduced[key] = items[key]
            }
        };

        return reduced;
    }
};