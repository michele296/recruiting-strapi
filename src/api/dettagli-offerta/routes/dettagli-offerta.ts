//dettagli-offerta.ts (routes)//
'use strict';

module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/offerta/:id/dettagli',
      handler: 'dettagli-offerta.dettagliOfferta',
      config: {
        auth: false
      }
    }
  ]
};
