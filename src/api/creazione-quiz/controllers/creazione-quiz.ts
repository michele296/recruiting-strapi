'use strict';

module.exports = {
  async crea(ctx) {
    const {
      utenteAziendaleId,
      offertaId,
      titolo,
      descrizione,
      soglia_minima,
      domande = []
    } = ctx.request.body;

    // Log dei dati ricevuti per debug
    console.log('📋 Dati ricevuti per creazione quiz:', {
      utenteAziendaleId,
      offertaId,
      titolo,
      descrizione,
      soglia_minima,
      domande: domande.length,
      domandeDettaglio: domande
    });

    if (!utenteAziendaleId || !offertaId || !titolo || !soglia_minima || domande.length === 0) {
      return ctx.badRequest('Dati del quiz incompleti');
    }

    try {
      const utente = await strapi.db.query('api::utente-aziendale.utente-aziendale').findOne({
        where: { id: utenteAziendaleId },
      });

      if (!utente) return ctx.notFound('Utente aziendale non trovato');

      if (!['AMMINISTRATORE', 'REFERENTE'].includes(utente.Ruolo)) {
        return ctx.forbidden('Solo amministratori o referenti possono creare quiz');
      }

      const offerta = await strapi.db.query('api::offerta.offerta').findOne({
        where: { id: offertaId },
        populate: { quiz: true }
      });

      if (!offerta) return ctx.notFound('Offerta non trovata');
      if (offerta.quiz) return ctx.badRequest('Questa offerta ha già un quiz associato');

      // Crea il quiz
      const nuovoQuiz = await strapi.db.query('api::quiz.quiz').create({
        data: {
          titolo,
          descrizione,
          soglia_minima,
          utente_aziendale: utente.id,
          offerta: offerta.id
        }
      });

      console.log('✅ Quiz creato con successo:', nuovoQuiz);

      const domandeCreate = [];

      // Processa ogni domanda
      for (let i = 0; i < domande.length; i++) {
        const domandaData = domande[i];
        const { testo, risposte = [] } = domandaData;

        console.log(`🔍 Processando domanda ${i + 1}:`, {
          testo,
          numeroRisposte: risposte.length,
          risposte: risposte
        });

        // Validazione più dettagliata
        if (!testo || typeof testo !== 'string' || testo.trim() === '') {
          console.warn(`⚠️ Domanda ${i + 1} saltata: testo mancante o non valido`, domandaData);
          continue;
        }

        if (!Array.isArray(risposte) || risposte.length === 0) {
          console.warn(`⚠️ Domanda ${i + 1} saltata: risposte mancanti o non valide`, domandaData);
          continue;
        }

        try {
          // Crea la domanda
          const nuovaDomanda = await strapi.db.query('api::domanda.domanda').create({
            data: {
              testo: testo.trim(),
              quiz: nuovoQuiz.id
            }
          });

          console.log(`✅ Domanda ${i + 1} creata:`, nuovaDomanda);

          // Crea le risposte per questa domanda
          const risposteCreate = [];
          for (let j = 0; j < risposte.length; j++) {
            const risposta = risposte[j];
            const { testo: testoRisposta, corretta } = risposta;

            console.log(`🔍 Processando risposta ${j + 1} per domanda ${i + 1}:`, risposta);

            if (!testoRisposta || typeof testoRisposta !== 'string' || testoRisposta.trim() === '') {
              console.warn(`⚠️ Risposta ${j + 1} della domanda ${i + 1} saltata: testo mancante`, risposta);
              continue;
            }

            try {
              const nuovaRisposta = await strapi.db.query('api::risposta.risposta').create({
                data: {
                  testo: testoRisposta.trim(),
                  corretta: !!corretta,
                  domanda: nuovaDomanda.id
                }
              });

              console.log(`✅ Risposta ${j + 1} creata per domanda ${i + 1}:`, nuovaRisposta);
              risposteCreate.push(nuovaRisposta);
            } catch (rispostaError) {
              console.error(`❌ Errore creazione risposta ${j + 1} per domanda ${i + 1}:`, rispostaError);
            }
          }

          // Aggiungi le risposte create alla domanda
          nuovaDomanda.risposte = risposteCreate;
          domandeCreate.push(nuovaDomanda);

        } catch (domandaError) {
          console.error(`❌ Errore creazione domanda ${i + 1}:`, domandaError);
        }
      }

      console.log(`✅ Processo completato. Domande create: ${domandeCreate.length}`);

      return ctx.created({
        quiz: nuovoQuiz,
        domande: domandeCreate,
        totaleDogandeProcessate: domandeCreate.length
      });

    } catch (err) {
      console.error('❌ Errore durante la creazione del quiz:', err);
      return ctx.internalServerError('Errore durante la creazione del quiz');
    }
  }
};