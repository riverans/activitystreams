/**
 * Actor
 *
 * @module      :: Model
 * @description :: A short summary of how this model works and what it represents.
 * @docs		:: http://sailsjs.org/#!documentation/models
 */

module.exports = {

  attributes: {
        //object type could be mmdb-user
        //object type could ys-photo
        objectType: {
            type: 'string',
            required: true,
            max: 25
        },
        appId: {
            type: 'integer',
            required: true, 
        },
        id: {
            type: 'integer',
            required: true
        },
        url: 'string'
    }


};
