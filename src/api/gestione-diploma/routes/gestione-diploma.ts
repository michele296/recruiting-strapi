/*/routes/gestione-laurea.js*/
'use strict';

module.exports = {
  routes: [
    {
      method: 'POST',
      path: '/gestione-diploma/aggiungi',
      handler: 'gestione-diploma.aggiungi',
      config: { auth: false },
    },
    {
      method: 'PUT',
      path: '/gestione-diploma/modifica/:id',
      handler: 'gestione-diploma.modifica',
      config: { auth: false },
    },
    {
      method: 'DELETE',
      path: '/gestione-diploma/rimuovi/:id',
      handler: 'gestione-diploma.rimuovi',
      config: { auth: false },
    }
  ],
};

