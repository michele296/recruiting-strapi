'use strict';

module.exports = {
  routes: [
    {
      method: 'POST',
      path: '/inserisci-cv/:candidatoId',
      handler: 'inserisci-cv.inserisciCV',
      config: {
        auth: false
      }
    }
  ]
};
