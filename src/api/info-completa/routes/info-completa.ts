module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/utente-candidato/:id/info-completa',
      handler: 'info-completa.infoCompleta',
      config: {
        policies: [],
        auth: false
      }
    }
  ]
};
