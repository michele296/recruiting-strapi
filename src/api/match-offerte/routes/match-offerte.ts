module.exports = {
  routes: [
    {
      method: 'POST',
      path: '/match-offerte',
      handler: 'match-offerte.trova',
      config: {
        auth: false, // se vuoi abilitare jwt metti true + policies
        policies: []
      }
    }
  ]
};

