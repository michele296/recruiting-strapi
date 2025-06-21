'use strict';

module.exports = {
  routes: [
    {
      method: 'PUT',
      path: '/stato-notifica/:id',
      handler: 'stato-notifica.aggiornaStato',
      config: {
        auth: false
      }
    }
  ]
};
