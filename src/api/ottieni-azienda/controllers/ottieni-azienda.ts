'use strict';

module.exports = {
  async infoAzienda(ctx) {
    const aziendaId = ctx.params.id;

    if (!aziendaId) return ctx.badRequest('ID azienda mancante');

    try {
      // 1. Recupera azienda con relazioni
      const azienda = await strapi.db.query('api::azienda.azienda').findOne({
        where: { id: aziendaId },
        populate: {
          utenti_aziendali: true,
          offertas: {
            populate: {
              utente_aziendale: true,
              diplomas: true,
              laureas: true,
              attestatoes: true,
              quiz: true,
              candidaturas: {
                populate: {
                  utente_candidato: true,
                  valutaziones: {
                    populate: {
                      utente_aziendale: true
                    }
                  }
                }
              }
            }
          }
        }
      });

      if (!azienda) return ctx.notFound('Azienda non trovata');

      // 2. Rimuovi password dagli utenti aziendali
      azienda.utenti_aziendali = azienda.utenti_aziendali.map(user => {
        const { Password, ...safeUser } = user;
        return safeUser;
      });

      // 3. Rimuovi password dagli utenti candidati nelle candidature
      azienda.offertas.forEach(offerta => {
        offerta.candidaturas?.forEach(c => {
          if (c.utente_candidato) {
            delete c.utente_candidato.Password;
          }
        });
      });

      // 4. Risposta finale
      return ctx.send({
        azienda
      });

    } catch (err) {
      console.error('Errore nel recupero azienda:', err);
      return ctx.internalServerError('Errore nel recupero delle informazioni dell\'azienda');
    }
  }
};
