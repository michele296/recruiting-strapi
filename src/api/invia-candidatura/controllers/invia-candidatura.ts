'use strict';

module.exports = {
  async invia(ctx) {
    const { offertaId, utenteCandidatoId } = ctx.request.body;
    
    if (!offertaId || !utenteCandidatoId) {
      return ctx.badRequest('offertaId e utenteCandidatoId sono obbligatori');
    }

    try {
      // Verifica se esiste già la candidatura
      const candidaturaEsistente = await strapi.db.query('api::candidatura.candidatura').findOne({
        where: {
          offerta: offertaId,
          utente_candidato: utenteCandidatoId
        }
      });

      if (candidaturaEsistente) {
        return ctx.badRequest('Hai già inviato la candidatura a questa offerta.');
      }

      // Recupera l'offerta con il quiz associato
      const offerta = await strapi.entityService.findOne('api::offerta.offerta', offertaId, {
        populate: ['quiz']
      });

      if (!offerta) {
        return ctx.badRequest('Offerta non trovata.');
      }

      let quizSuperato = false;

      // Verifica se l'offerta ha un quiz associato
      if ((offerta as any).quiz) {
        // Cerca se l'utente ha eseguito il quiz
        const quizEseguito = await strapi.db.query('api::quiz-eseguito.quiz-eseguito').findOne({
          where: {
            utente_candidato: utenteCandidatoId,
            quiz: (offerta as any).quiz.id
          }
        });

        if (!quizEseguito) {
          return ctx.badRequest('Devi completare il quiz associato a questa offerta prima di candidarti.');
        }

        if (!quizEseguito.superato) {
          return ctx.badRequest('Devi superare il quiz associato a questa offerta per poterti candidare.');
        }

        quizSuperato = true;
      }

      // Crea la candidatura
      const nuovaCandidatura = await strapi.entityService.create('api::candidatura.candidatura', {
        data: {
          data_candidatura: new Date(),
          Stato: 'inviata',
          quiz_superato: quizSuperato,
          offerta: offertaId,
          utente_candidato: utenteCandidatoId
        }
      });

      return ctx.send({
        message: 'Candidatura inviata con successo',
        candidatura: nuovaCandidatura
      });

    } catch (error) {
      console.error('Errore candidatura:', error);
      return ctx.internalServerError('Errore interno');
    }
  }
};