module.exports = {
  routes: [
    {
      method: 'POST',
      path: '/invia-candidatura/invia',
      handler: 'invia-candidatura.invia',
      config: {
        auth: false, 
        policies: []
      }
    }
  ]
};

