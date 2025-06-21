'use strict';

module.exports = {
  async aggiornaStato(ctx) {
    const notificaId = ctx.params.id;

    if (!notificaId) {
      return ctx.badRequest('ID notifica mancante');
    }

    try {
      const notificaEsistente = await strapi.db.query('api::notifica.notifica').findOne({
        where: { id: notificaId }
      });

      if (!notificaEsistente) {
        return ctx.notFound('Notifica non trovata');
      }

      const notificaAggiornata = await strapi.db.query('api::notifica.notifica').update({
        where: { id: notificaId },
        data: { letto: true }
      });

      return ctx.send({ message: 'Notifica aggiornata con successo', notifica: notificaAggiornata });

    } catch (err) {
      console.error('Errore durante aggiornamento notifica:', err);
      return ctx.internalServerError('Errore interno');
    }
  }
};
