/*/controllers/gestione-attestato.js*/
'use strict';

module.exports = {
  async aggiungi(ctx) {
    const { idUtente, livello, attestato_id } = ctx.request.body;

    if (!idUtente || !livello || !attestato_id) {
      return ctx.badRequest('Dati mancanti');
    }

    try {
      const nuova = await strapi.entityService.create('api::ha-attestato.ha-attestato', {
        data: {
          livello,
          attestato: attestato_id,
          utente_candidato: idUtente,
        },
      });

      return ctx.send({ 
        messaggio: 'Attestato aggiunto con successo', 
        entry: nuova 
      });
    } catch (err) {
      console.error('Errore in aggiunta attestato:', err);
      return ctx.internalServerError('Errore durante l\'aggiunta dell\'attestato');
    }
  },

  async modifica(ctx) {
    const { id } = ctx.params;
    const { livello } = ctx.request.body;

    if (!livello) {
      return ctx.badRequest('Livello mancante');
    }

    try {
      const mod = await strapi.entityService.update('api::ha-attestato.ha-attestato', id, {
        data: { 
          livello
        },
      });

      return ctx.send({ 
        messaggio: 'Attestato modificato con successo', 
        entry: mod 
      });
    } catch (err) {
      console.error('Errore in modifica attestato:', err);
      return ctx.internalServerError('Errore durante la modifica dell\'attestato');
    }
  },

  async rimuovi(ctx) {
    const { id } = ctx.params;

    try {
      await strapi.entityService.delete('api::ha-attestato.ha-attestato', id);
      return ctx.send({ 
        messaggio: 'Attestato rimosso con successo' 
      });
    } catch (err) {
      console.error('Errore in rimozione attestato:', err);
      return ctx.internalServerError('Errore durante la rimozione dell\'attestato');
    }
  }
};