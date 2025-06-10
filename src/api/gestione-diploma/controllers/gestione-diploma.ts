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
    const { id } = ctx.params; // ID del record ha-diploma da modificare
    const { voto_diploma, diploma_id, scuola_id } = ctx.request.body;

    if (!voto_diploma && !diploma_id && !scuola_id) {
      return ctx.badRequest('Nessun dato fornito per l\'aggiornamento');
    }

    try {
      const aggiornato = await strapi.entityService.update('api::ha-diploma.ha-diploma', id, {
        data: {
          ...(voto_diploma !== undefined && { voto: voto_diploma }),
          ...(diploma_id && { diploma: diploma_id }),
          ...(scuola_id && { scuola: scuola_id }),
        },
      });

      return ctx.send({ messaggio: 'Diploma aggiornato con successo', diploma: aggiornato });
    } catch (err) {
      console.error(err);
      return ctx.internalServerError('Errore durante la modifica del diploma');
    }
  }
};
