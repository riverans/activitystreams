var assert = require('assert'),
    expect = require('expect.js'),
    _ = require('lodash'),
    sails = require('sails');


describe('Pagination', function() {
    describe('When I give a list of 4 items and I ask offset=2 and limit=2', function() {
        it('The resulting list should only contain the 3th and 4th element', function (done) {
            var reduced_items,
                items = {
                    '0': {'aid': 1},
                    '1': {'aid': 2},
                    '2': {'aid': 3},
                    '3': {'aid': 4}
                };
            reduced_items = sails.services.pagination({'offset': 2, 'limit': 2}, items);
            expect(reduced_items).to.only.have.keys('2', '3');

            items = [
                {'aid': 1},
                {'aid': 2},
                {'aid': 3},
                {'aid': 4}
            ];
            reduced_items = sails.services.pagination({'offset': 2, 'limit': 2}, items);
            expect(reduced_items).to.contain(items[2]);
            expect(reduced_items).to.contain(items[3]);
            expect(reduced_items).to.not.contain(items[0]);
            expect(reduced_items).to.not.contain(items[1]);
            done();
        });
    });

    describe('When I give a list of 4 items and I ask for the second page and limit=2', function() {
        it('The resulting list should only contain the 3th and 4th element', function (done) {
            var reduced_items,
                items = {
                    '0': {'aid': 1},
                    '1': {'aid': 2},
                    '2': {'aid': 3},
                    '3': {'aid': 4}
                };
            reduced_items = sails.services.pagination({'page': 2, 'limit': 2}, items);
            expect(reduced_items).to.only.have.keys('2', '3');

            items = [
                {'aid': 1},
                {'aid': 2},
                {'aid': 3},
                {'aid': 4}
            ];
            reduced_items = sails.services.pagination({'page': 2, 'limit': 2}, items);
            expect(reduced_items).to.contain(items[2]);
            expect(reduced_items).to.contain(items[3]);
            expect(reduced_items).to.not.contain(items[0]);
            expect(reduced_items).to.not.contain(items[1]);
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
            reduced_items = sails.services.pagination({'limit': 0}, items);
            expect(reduced_items).to.be.empty();

            items = [
                {'aid': 1},
                {'aid': 2},
                {'aid': 3},
                {'aid': 4}
            ];
            reduced_items = sails.services.pagination({'limit': 0}, items);
            expect(reduced_items).to.be.empty();
            done();
        });
    });

    describe('When I ask for an offset bigger than the number of items', function() {
        it('The resulting list should not contain any items', function (done) {
            var reduced_items,
                items = {
                    '0': {'aid': 1},
                    '1': {'aid': 2},
                    '2': {'aid': 3},
                    '3': {'aid': 4}
                };
            reduced_items = sails.services.pagination({'offset': 4, 'limit': 2}, items);
            expect(reduced_items).to.be.empty();

            items = [
                {'aid': 1},
                {'aid': 2},
                {'aid': 3},
                {'aid': 4}
            ];
            reduced_items = sails.services.pagination({'offset': 4, 'limit': 2}, items);
            expect(reduced_items).to.be.empty();
            done();
        });
    });

    describe('When I ask for a page bigger than the number of items', function() {
        it('The resulting list should not contain any items', function (done) {
            var reduced_items,
                items = {
                    '0': {'aid': 1},
                    '1': {'aid': 2},
                    '2': {'aid': 3},
                    '3': {'aid': 4}
                };
            reduced_items = sails.services.pagination({'page': 3, 'limit': 2}, items);
            expect(reduced_items).to.be.empty();

            items = [
                {'aid': 1},
                {'aid': 2},
                {'aid': 3},
                {'aid': 4}
            ];
            reduced_items = sails.services.pagination({'page': 3, 'limit': 2}, items);
            expect(reduced_items).to.be.empty();
            done();
        });
    });
});