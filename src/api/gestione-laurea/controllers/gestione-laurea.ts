/*/controllers/gestione-laurea.js*/
'use strict';

module.exports = {
  async aggiungi(ctx) {
    const { idUtente, voto, laurea_id, universita_id } = ctx.request.body;
    if (!idUtente || !voto || !laurea_id || !universita_id) {
      return ctx.badRequest('Dati mancanti');
    }

    try {
      // Crea ha_laurea con le relazioni
      const nuova = await strapi.entityService.create('api::ha-laurea.ha-laurea', {
        data: {
          voto,
          laurea: laurea_id,
          utente_candidato: idUtente,
          universita: universita_id,
        },
      });

      return ctx.send({
        messaggio: 'Laurea salvata con successo',
        entry: nuova,
      });
    } catch (err) {
      console.error('Errore in aggiunta laurea:', err);
      return ctx.internalServerError('Errore salvataggio laurea');
    }
  },

  async modifica(ctx) {
    const { id } = ctx.params;
    const { voto, laurea_id, universita_id } = ctx.request.body;
    if (!voto || !laurea_id || !universita_id) {
      return ctx.badRequest('Dati mancanti');
    }

    try {
      // Modifica la riga ha_laurea
      const mod = await strapi.entityService.update('api::ha-laurea.ha-laurea', id, {
        data: {
          voto,
          laurea: laurea_id,
          universita: universita_id,
        },
      });

      return ctx.send({
        messaggio: 'Laurea modificata con successo',
        entry: mod,
      });
    } catch (err) {
      console.error('Errore in modifica laurea:', err);
      return ctx.internalServerError('Errore modifica laurea');
    }
  },

  async rimuovi(ctx) {
    const { id } = ctx.params;
    try {
      await strapi.entityService.delete('api::ha-laurea.ha-laurea', id);
      return ctx.send({ messaggio: 'Laurea rimossa correttamente' });
    } catch (err) {
      console.error('Errore in rimozione laurea:', err);
      return ctx.internalServerError('Errore rimozione laurea');
    }
  },
};