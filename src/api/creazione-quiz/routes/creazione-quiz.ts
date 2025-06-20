module.exports = {
  routes: [
    {
      method: 'POST',
      path: '/creazione-quiz',
      handler: 'creazione-quiz.crea',
      config: {
        policies: [],
        auth: false
      }
    }
  ]
};
