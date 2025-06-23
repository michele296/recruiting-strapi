'use strict';

module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/ottieni-azienda/:id',
      handler: 'ottieni-azienda.infoAzienda',
      config: {
        policies: [],
        auth: false
      }
    }
  ]
};
