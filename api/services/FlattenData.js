/*jslint node: true */
'use strict';

/**
 * Not all the controller responses use the same data structure. Some
 * responses must be flattened so that they resemble others and all the
 * data can be fed to the same caching methods.
 * @param {array} data The data to flatten.
 * @return {array} An array of activities.
 */
module.exports = function(data) {
    var activities = [];
    for (var i = 0; i < data.length; i++) {
        for (var key in data[i].items) {
            if (data[i].items.hasOwnProperty(key)) {
                activities.push(data[i].items[key]);
            }
        }
    }
    return activities;
};
