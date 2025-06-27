'use strict';

module.exports = {
  async ottieniColloqui(ctx) {
    const { aziendaId } = ctx.params;
    const { offertaId, dataInizio, dataFine } = ctx.query;
    
    if (!aziendaId) {
      return ctx.badRequest('ID azienda richiesto');
    }

    try {
      // Query per ottenere tutti i colloqui dell'azienda
      let whereClause: any = {
        data_colloquio: { $ne: null },
        offerta: {
          utente_aziendale: {
            azienda: aziendaId
          }
        }
      };

      // Filtro per offerta specifica
      if (offertaId) {
        whereClause.offerta = {
          id: offertaId,
          utente_aziendale: {
            azienda: aziendaId
          }
        };
      }

      // Filtro per data
      if (dataInizio || dataFine) {
        let dateFilter: any = { $ne: null };
        if (dataInizio) {
          dateFilter.$gte = new Date(dataInizio);
        }
        if (dataFine) {
          dateFilter.$lte = new Date(dataFine);
        }
        whereClause.data_colloquio = dateFilter;
      }

      const colloqui = await strapi.db.query('api::candidatura.candidatura').findMany({
        where: whereClause,
        populate: {
          utente_candidato: true,
          offerta: {
            populate: {
              utente_aziendale: {
                populate: {
                  azienda: true
                }
              }
            }
          }
        },
        orderBy: { data_colloquio: 'asc' }
      });

      // Formatta i dati per il frontend
      const colloquiFormattati = colloqui.map(candidatura => ({
        id: candidatura.id,
        data_colloquio: candidatura.data_colloquio,
        info_colloquio: candidatura.info_colloquio,
        stato: candidatura.Stato,
        candidato: {
          id: candidatura.utente_candidato?.id,
          nome: candidatura.utente_candidato?.Nome,
          cognome: candidatura.utente_candidato?.Cognome,
          email: candidatura.utente_candidato?.Email
        },
        offerta: {
          id: candidatura.offerta?.id,
          info: candidatura.offerta?.info,
          tipo_contratto: candidatura.offerta?.tipo_contratto,
          provincia: candidatura.offerta?.Provincia
        }
      }));

      return ctx.send({
        colloqui: colloquiFormattati,
        totale: colloquiFormattati.length
      });

    } catch (error) {
      console.error('Errore nel recupero colloqui:', error);
      return ctx.internalServerError('Errore nel recupero dei colloqui');
    }
  }
};
