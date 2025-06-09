// src/api/registrazione-azienda/routes/registrazione-azienda.js
module.exports = {
  routes: [
    {
      method: 'POST',
      path: '/registrazione-azienda',
      handler: 'registrazione-azienda.registra',
      config: {
        auth: false,
        policies: [],
        middlewares: [],
      },
    },
  ],
};