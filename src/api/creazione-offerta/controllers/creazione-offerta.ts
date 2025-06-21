'use strict';

module.exports = {
  async crea(ctx) {
    const {
      utenteAziendaleId,
      tipo_contratto,
      info,
      benefit,
      Provincia,
      stipendio,
      diplomaIds = [],
      laureaIds = [],
      attestatoIds = [],
      quizId
    } = ctx.request.body;

    if (!utenteAziendaleId) return ctx.badRequest('ID utente aziendale mancante');

    try {
      const utente = await strapi.db.query('api::utente-aziendale.utente-aziendale').findOne({
        where: { id: utenteAziendaleId },
        populate: { azienda: true }
      });

      if (!utente) return ctx.notFound('Utente aziendale non trovato');

      if (!['AMMINISTRATORE', 'REFERENTE'].includes(utente.Ruolo)) {
        return ctx.forbidden('Solo amministratori o referenti possono creare offerte');
      }

      // ✅ Creo la nuova offerta, includendo l'azienda
      const nuovaOfferta = await strapi.db.query('api::offerta.offerta').create({
        data: {
          tipo_contratto,
          info,
          benefit,
          Provincia,
          stipendio,
          utente_aziendale: utente.id,
          azienda: utente.azienda.id, // <-- Aggiunta la relazione con Azienda
          diplomas: diplomaIds,
          laureas: laureaIds,
          attestatoes: attestatoIds,
          quiz: quizId || null,
        }
      });

      // Trovo candidati compatibili per inviare notifiche
      if (Provincia && (diplomaIds.length || laureaIds.length || attestatoIds.length)) {
        
        const whereConditions = {
          Provincia: Provincia,
          $or: []
        };

        if (diplomaIds.length > 0) {
          whereConditions.$or.push({
            ha_diplomas: {
              diploma: {
                id: { $in: diplomaIds }
              }
            }
          });
        }

        if (laureaIds.length > 0) {
          whereConditions.$or.push({
            ha_laureas: {
              laurea: {
                id: { $in: laureaIds }
              }
            }
          });
        }

        if (attestatoIds.length > 0) {
          whereConditions.$or.push({
            ha_attestatoes: {
              attestato: {
                id: { $in: attestatoIds }
              }
            }
          });
        }

        const candidatiCompatibili = await strapi.db.query('api::utente-candidato.utente-candidato').findMany({
          where: whereConditions,
          populate: { 
            pannello_notifiche: true,
            ha_diplomas: { populate: { diploma: true } },
            ha_laureas: { populate: { laurea: true } },
            ha_attestatoes: { populate: { attestato: true } }
          }
        });

        for (const candidato of candidatiCompatibili) {
          if (candidato.pannello_notifiche) {
            await strapi.db.query('api::notifica.notifica').create({
              data: {
                titolo: 'Nuova offerta compatibile disponibile',
                messaggio: `È stata pubblicata una nuova offerta adatta al tuo profilo: ${nuovaOfferta.tipo_contratto || 'Visualizza i dettagli'}`,
                letto: false,
                data_invio: new Date(),
                pannello_notifiche: candidato.pannello_notifiche.id,
              }
            });
          }
        }
      }

      return ctx.created(nuovaOfferta);
    } catch (err) {
      console.error('Errore durante creazione offerta:', err);
      return ctx.internalServerError('Errore durante la creazione');
    }
  }
};
