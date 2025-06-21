//dettagli-offerta.ts (controller)//
'use strict';

module.exports = {
  async dettagliOfferta(ctx) {
    const offertaId = ctx.params.id;
    if (!offertaId) return ctx.badRequest('ID offerta mancante');

    try {
      const offerta = await strapi.db.query('api::offerta.offerta').findOne({
        where: { id: offertaId },
        populate: {
          azienda: true,
          utente_aziendale: {
            populate: {
              azienda: true
            }
          },
          diplomas: true,
          laureas: true,
          attestatoes: true,
          quiz: {
            populate: {
              domanda: {
                populate: {
                  rispostas: true
                }
              }
            }
          }
        }
      });

      if (!offerta) return ctx.notFound('Offerta non trovata');

      return ctx.send(offerta);
    } catch (err) {
      console.error('Errore nel recupero dettagli offerta:', err);
      return ctx.internalServerError('Errore interno');
    }
  }
};
