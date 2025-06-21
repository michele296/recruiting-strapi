'use strict';

module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/formazione',
      handler: 'visualizza-formazione.visualizza',
      config: {
        auth: false
      }
    }
  ]
};
