'use strict';

module.exports = {
  routes: [
    {
      method: 'POST',
      path: '/crea-valutazione',
      handler: 'crea-valutazione.crea',
      config: {
        auth: false
      }
    }
  ]
};
