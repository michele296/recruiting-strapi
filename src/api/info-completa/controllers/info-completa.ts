'use strict';

module.exports = {
  async infoCompleta(ctx) {
    const candidatoId = ctx.params.id;
    if (!candidatoId) return ctx.badRequest('ID mancante');

    try {
      // 1. Ottieni candidato completo con relazioni corrette
      const candidato = await strapi.db.query('api::utente-candidato.utente-candidato').findOne({
        where: { id: candidatoId },
        populate: {
          // Usa le relazioni intermedie corrette
          ha_diplomas: {
            populate: {
              diploma: true,
              scuola: true
            }
          },
          ha_laureas: {
            populate: {
              laurea: true,
              universita: true
            }
          },
          ha_attestatoes: {
            populate: {
              attestato: true
            }
          },
          pannello_notifiche: {
            populate: { notifiche: true }
          },
          candidaturas: {
            populate: {
              offerta: true
            }
          }
        }
      });

      if (!candidato) return ctx.notFound('Candidato non trovato');

      // 2. Rimuovi la password
      delete candidato.Password;

      // 3. Estrai gli ID dai diplomi, lauree e attestati attraverso le relazioni intermedie
      const diplomiIds = (candidato.ha_diplomas || []).map(hd => hd.diploma?.id).filter(Boolean);
      const laureeIds = (candidato.ha_laureas || []).map(hl => hl.laurea?.id).filter(Boolean);
      const attestatiIds = (candidato.ha_attestatoes || []).map(ha => ha.attestato?.id).filter(Boolean);
      const provinciaUtente = candidato.Provincia?.toLowerCase() || '';

      // 4. Offerte compatibili con diploma, laurea, attestato, provincia
      let offerteCompatibili = [];
      
      if (diplomiIds.length > 0 || laureeIds.length > 0 || attestatiIds.length > 0) {
        // Costruisci la condizione $or
        const orConditions = [];
        if (diplomiIds.length > 0) {
          orConditions.push({ diplomas: { id: { $in: diplomiIds } } });
        }
        if (laureeIds.length > 0) {
          orConditions.push({ laureas: { id: { $in: laureeIds } } });
        }
        if (attestatiIds.length > 0) {
          orConditions.push({ attestatoes: { id: { $in: attestatiIds } } });
        }

        // Usa any per evitare problemi TypeScript con Strapi
        const whereConditions: any = {
          Provincia: { $eqi: provinciaUtente }
        };

        if (orConditions.length > 0) {
          whereConditions.$or = orConditions;
        }

        offerteCompatibili = await strapi.db.query('api::offerta.offerta').findMany({
          where: whereConditions,
          populate: {
            utente_aziendale: {
              populate: {
                azienda: true
              }
            },
            diplomas: true,
            laureas: true,
            attestatoes: true,
            quiz: true
          }
        });
      }

      // 5. Prepara i dati formattati per la risposta
      const diplomi = (candidato.ha_diplomas || []).map(hd => ({
        ...hd.diploma,
        voto: hd.voto,
        scuola: hd.scuola
      }));

      const lauree = (candidato.ha_laureas || []).map(hl => ({
        ...hl.laurea,
        voto: hl.voto,
        universita: hl.universita
      }));

      const attestati = (candidato.ha_attestatoes || []).map(ha => ({
        ...ha.attestato,
        livello: ha.livello
      }));

      // 6. Risposta finale
      return ctx.send({
        candidato: {
          ...candidato,
          // Rimuovi le relazioni intermedie dalla risposta principale
          ha_diplomas: undefined,
          ha_laureas: undefined,
          ha_attestatoes: undefined
        },
        offerteCompatibili,
        candidature: candidato.candidaturas || [],
        diplomi,
        lauree,
        attestati,
        pannelloNotifiche: candidato.pannello_notifiche
      });

    } catch (err) {
      console.error('Errore durante il recupero info candidato:', err);
      return ctx.internalServerError('Errore nel recupero delle informazioni');
    }
  }
};