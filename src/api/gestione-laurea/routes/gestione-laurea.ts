/*/routes/gestione-laurea.js*/
'use strict';

module.exports = {
routes: [
{
method: 'POST',
path: '/gestione-laurea/aggiungi',
handler: 'gestione-laurea.aggiungi',
config: { auth: false },
},
{
method: 'PUT',
path: '/gestione-laurea/modifica/:id',
handler: 'gestione-laurea.modifica',
config: { auth: false },
},
{
method: 'DELETE',
path: '/gestione-laurea/rimuovi/:id',
handler: 'gestione-laurea.rimuovi',
config: { auth: false },
},
],
};
