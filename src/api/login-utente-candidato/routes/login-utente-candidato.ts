'use strict';

module.exports = {
  routes: [
    {
      method: 'POST',
      path: '/login-utente-candidato/login',
      handler: 'login-utente-candidato.login',
      config: {
        auth: false,
        policies: [],
        middlewares: [],
      },
    },
  ],
};
