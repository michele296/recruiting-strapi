module.exports = {
  routes: [
    {
      method: 'POST',
      path: '/creazione-offerta',
      handler: 'creazione-offerta.crea',
      config: {
        policies: [],
        auth: false, // 👈 disattiva autenticazione
      },
    },
  ],
};
