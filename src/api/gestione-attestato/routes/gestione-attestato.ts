/*/routes/gestione-attestato.js*/
'use strict';

module.exports = {
  routes: [
    {
      method: 'POST',
      path: '/gestione-attestato/aggiungi',
      handler: 'gestione-attestato.aggiungi',
      config: { auth: false },
    },
    {
      method: 'PUT',
      path: '/gestione-attestato/modifica/:id',
      handler: 'gestione-attestato.modifica',
      config: { auth: false },
    },
    {
      method: 'DELETE',
      path: '/gestione-attestato/rimuovi/:id',
      handler: 'gestione-attestato.rimuovi',
      config: { auth: false },
    },
  ],
};
