'use strict';

module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/compatibilita-offerta/:offertaId/:candidatoId',
      handler: 'compatibilita-offerta.calcolaCompatibilita',
      config: {
        auth: false
      }
    }
  ]
};