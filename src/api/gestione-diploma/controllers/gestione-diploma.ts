'use strict';

module.exports = {
  async aggiungi(ctx) {
    const { idUtente, voto_diploma, diploma_id, scuola_id } = ctx.request.body;

    if (!idUtente || !voto_diploma || !diploma_id || !scuola_id) {
      return ctx.badRequest('Dati mancanti');
    }

    try {
      // Crea un nuovo record ha-diploma associato all'utente
      const nuovoDiploma = await strapi.entityService.create('api::ha-diploma.ha-diploma', {
        data: {
          voto: voto_diploma,
          utente_candidato: idUtente,
          diploma: diploma_id,
          scuola: scuola_id,
        },
      });

      return ctx.send({ messaggio: 'Diploma aggiunto correttamente', diploma: nuovoDiploma });
    } catch (err) {
      console.error(err);
      return ctx.internalServerError('Errore durante il salvataggio del diploma');
    }
  },

  async modifica(ctx) {
    const { id } = ctx.params;
    const { voto_diploma, scuola_id } = ctx.request.body;

    if (!voto_diploma || !scuola_id) {
      return ctx.badRequest('Voto e scuola sono richiesti');
    }

    try {
      const aggiornato = await strapi.entityService.update('api::ha-diploma.ha-diploma', id, {
        data: {
          voto: voto_diploma,
          scuola: scuola_id,
        },
      });

      return ctx.send({ messaggio: 'Diploma aggiornato con successo', diploma: aggiornato });
    } catch (err) {
      console.error(err);
      return ctx.internalServerError('Errore durante la modifica del diploma');
    }
  },

  async rimuovi(ctx) {
    const { id } = ctx.params;

    try {
      await strapi.entityService.delete('api::ha-diploma.ha-diploma', id);
      return ctx.send({ messaggio: 'Diploma rimosso con successo' });
    } catch (err) {
      console.error('Errore in rimozione diploma:', err);
      return ctx.internalServerError('Errore durante la rimozione del diploma');
    }
  }
};
