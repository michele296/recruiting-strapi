'use strict';

module.exports = {
  routes: [
    {
      method: 'POST',
      path: '/registrazione-utente-candidato/registra',
      handler: 'registrazione-utente-candidato.registra',
      config: {
        auth: false,
        policies: [],
        middlewares: [],
      },
    },
  ],
};
