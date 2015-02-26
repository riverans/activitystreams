module.exports.policies = {
  // Default policy for all controllers and actions
  // (`true` allows public access)
  '*': true,

  ActivityController: {
      '*': ['isSanitized', 'isCached'],
      postSpecificActivity:  ['isSanitized', 'isAuthenticated'],
      deleteSpecificActivity: ['isSanitized','isAuthenticated']
  },

  ActorController: {
      '*': ['isSanitized', 'isCached'],
      deleteSpecificActor: ['isSanitized', 'isAuthenticated']
   },

  ObjectController: {
      '*': ['isSanitized', 'isCached'],
      deleteSpecificObject: ['isSanitized', 'isAuthenticated']
  },

  ProxyController: {
      '*': ['isSanitized', 'isCached']
  },
};
