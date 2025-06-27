'use strict';

module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/ottieni-colloqui/:aziendaId',
      handler: 'ottieni-colloqui.ottieniColloqui',
      config: {
        auth: false
      }
    }
  ]
};
