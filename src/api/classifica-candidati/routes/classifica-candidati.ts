// src/api/classifica-candidati/routes/index.js

'use strict';

module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/classifica-candidati/:offertaId',
      handler: 'classifica-candidati.classificaCandidati',
      config: {
  policies: [],
  middlewares: [],
  auth: false,
},
    },
  ],
};