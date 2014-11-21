var assert = require('assert'),
    expect = require('expect.js'),
    _ = require('lodash'),
    sails = require('sails');


describe('Pagination', function() {
    describe('When I give a list of 4 items and I ask for the second page and limit=2', function() {
        it('The resulting list should only contain the 3th and 4th element', function (done) {
            var reduced_items,
                items = {
                    '0': {'aid': 1},
                    '1': {'aid': 2},
                    '2': {'aid': 3},
                    '3': {'aid': 4}
                };
            reduced_items = sails.services.pagination.paginate({'offset': 2, 'limit': 2}, items);
            expect(reduced_items).to.only.have.keys('2', '3');
            done();
        });
    });

    describe('When I use limit=0', function() {
        it('The resulting list should not contain any items', function (done) {
            var reduced_items,
                items = {
                    '0': {'aid': 1},
                    '1': {'aid': 2},
                    '2': {'aid': 3},
                    '3': {'aid': 4}
                };
            reduced_items = sails.services.pagination.paginate({'limit': 0}, items);
            expect(reduced_items).to.be.empty();
            done();
        });
    });

});