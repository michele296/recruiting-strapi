'use strict';

// Interfacce per TypeScript
interface CandidaturaPopulated {
  id: number;
  offerta?: {
    id: number;
    tipo_contratto?: string;
    info?: string;
    benefit?: string;
    Provincia?: string;
    stipendio?: number;
  };
  utente_candidato?: {
    id: number;
    pannello_notifiche?: {
      id: number;
    };
  };
}

module.exports = {
  async crea(ctx) {
    const {
      valutazione_tecnica,
      valutazione_soft,
      motivazione,
      note_private,
      data_valutazione,
      candidatura,
      utente_aziendale,
      nuovo_stato // 'accettata' o 'rifiutata'
    } = ctx.request.body;

    if (!ctx.request.body?.candidatura || !ctx.request.body?.nuovo_stato?.trim() || !ctx.request.body?.motivazione?.trim()) {
      return ctx.badRequest('Parametri obbligatori mancanti o invalidi');
    }

    try {
      // 1. Verifica la candidatura esistente con entityService (alternativa)
      const candidaturaEsistente = await strapi.entityService.findOne('api::candidatura.candidatura', candidatura, {
        populate: {
          offerta: {
            fields: ['id', 'tipo_contratto', 'info', 'benefit', 'Provincia', 'stipendio']
          },
          utente_candidato: {
            populate: { 
              pannello_notifiche: {
                fields: ['id']
              }
            }
          },
        },
      });

      if (!candidaturaEsistente) {
        return ctx.notFound('Candidatura non trovata');
      }

      console.log('Candidatura trovata:', JSON.stringify(candidaturaEsistente, null, 2));

      // Cast con interfaccia tipizzata
      const candidaturaConRelazioni = candidaturaEsistente as CandidaturaPopulated;

      // 2. Crea la valutazione
      const nuovaValutazione = await strapi.db.query('api::valutazione.valutazione').create({
        data: {
          valutazione_tecnica,
          valutazione_soft,
          motivazione,
          note_private,
          data_valutazione,
          candidatura,
          utente_aziendale
        }
      });

      // 3. Aggiorna stato candidatura
      await strapi.db.query('api::candidatura.candidatura').update({
        where: { id: candidatura },
        data: { Stato: nuovo_stato }
      });

      // 4. Invia una notifica al candidato
      const pannelloId = candidaturaConRelazioni.utente_candidato?.pannello_notifiche?.id;
      
      if (pannelloId) {
        // Recupera l'offerta collegata alla candidatura
        const offerta = candidaturaConRelazioni.offerta;
        let nomeOfferta = 'un\'offerta';
        
        console.log('Dati offerta:', offerta);
        
        if (offerta?.info && offerta.info.trim()) {
          nomeOfferta = `"${offerta.info}"`;
        } else if (offerta?.tipo_contratto && offerta.tipo_contratto.trim()) {
          nomeOfferta = `un'offerta di tipo ${offerta.tipo_contratto}`;
        }

        await strapi.entityService.create('api::notifica.notifica', {
          data: {
            titolo: `Valutazione candidatura ${nomeOfferta} : ${nuovo_stato.toUpperCase()}`,
            messaggio: `La tua candidatura per ${nomeOfferta} è stata ${nuovo_stato}. Motivo: ${motivazione}`,
            letto: false,
            data_invio: new Date(),
            pannello_notifiche: pannelloId,
          }
        });
      }

      return ctx.send({
        message: 'Valutazione creata, candidatura aggiornata e notifica inviata',
        valutazione: nuovaValutazione
      });

    } catch (error) {
      console.error('Errore nella creazione valutazione:', error);
      return ctx.internalServerError('Errore interno nella creazione della valutazione');
    }
  }
};