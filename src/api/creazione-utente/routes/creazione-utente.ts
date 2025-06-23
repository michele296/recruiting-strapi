/**
 * Routes per la creazione di utenti aziendali
 * Path: src/api/creazione-utente/routes/creazione-utente.ts
 */

module.exports = {
  routes: [
    {
      method: 'POST',
      path: '/creazione-utente',
      handler: 'creazione-utente.create',
      config: {
        policies: [],
        middlewares: [],
        auth: false,
      },
    },
  ],
};