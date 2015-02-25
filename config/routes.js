module.exports.routes = {
  '/index': {
    view: 'home/index'
  },

  // Establish session auth cookie
  'get /api/v1': 'ServiceController.setCookie',

  // Socket session subscribe
  'post /api/v1/subscribe': 'ServiceController.subscribe',

  // Activity streams Activity
  // GET
  'get /api/v1/activity/:actor/:actor_id/:verb/:object/:object_id': 'ActivityController.getSpecificActivity', //1
  // POST
  'post /api/v1/activity': 'ActivityController.postSpecificActivity', //Bust
  // DELETE
  'delete /api/v1/activity/:actor/:actor_id/:verb/:object/:object_id': 'ActivityController.deleteSpecificActivity', //Bust

  // Activity streams Actor GET
  'get /api/v1/actor/:actor': 'ActorController.getAllActorsOfType', //5
  'get /api/v1/actor/:actor/:actor_id': 'ActorController.getSpecificActor', //4
  'get /api/v1/actor/:actor/:actor_id/activities': 'ActorController.getAllActivitiesByActor', //4
  'get /api/v1/actor/:actor/:actor_id/:verb': 'ActorController.getAllObjectsVerbedByActor', //3
  'get /api/v1/actor/:actor/:actor_id/:verb/:object': 'ActorController.getSpecificObjectTypeVerbedByActor', //2
  'get /api/v1/actor/:actor/:actor_id/:verb/:object/:object_id': 'ActivityController.getSpecificActivity', //1

  // Activity Streams Actor DELETE
  'delete /api/v1/actor/:actor/:actor_id': 'ActorController.deleteSpecificActor', //Bust

  // Activity streams Object GET
  'get /api/v1/object/:object': 'ObjectController.getAllObjectsOfType', //5
  'get /api/v1/object/:object/:object_id': 'ObjectController.getSpecificObject', //4
  'get /api/v1/object/:object/:object_id/activities': 'ObjectController.getAllActivitiesByObject', //4
  'get /api/v1/object/:object/:object_id/:verb': 'ObjectController.getAllActorsWhoVerbedObject', //3
  'get /api/v1/object/:object/:object_id/:verb/:actor': 'ObjectController.getSpecificActorTypeWhoVerbedObject', //2
  'get /api/v1/object/:object/:object_id/:verb/:actor/:actor_id': 'ActivityController.getSpecificActivity', //1

  // Activity Streams Object DELETE
  'delete /api/v1/object/:object/:object_id': 'ObjectController.deleteSpecificObject', //Bust

  // Activity Streams Proxy GET
  'get /api/v1/proxy/:actor/:actor_id': 'ProxyController.getProxyActivities' //1
};
