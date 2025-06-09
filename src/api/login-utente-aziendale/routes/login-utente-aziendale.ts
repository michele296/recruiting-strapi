'use strict';

module.exports = {
  routes: [
    {
      method: 'POST',
      path: '/login-utente-aziendale/login',
      handler: 'login-utente-aziendale.login',
      config: {
        auth: false,
        policies: [],
        middlewares: [],
      },
    },
  ],
};
