// registrazione-candidato.js
'use strict';

module.exports = {
  async registra(ctx) {
    const {
      nome,
      cognome,
      email,
      password,
      dataDiNascita,
      citta,
      provincia,
      nazione
    } = ctx.request.body;

    if (!nome || !cognome || !email || !password) {
      return ctx.badRequest('Campi obbligatori mancanti');
    }

    try {
      const candidatoEsistente = await strapi.db.query('api::utente-candidato.utente-candidato').findOne({
        where: { Email: email },
      });

      if (candidatoEsistente) {
        return ctx.conflict('Email già registrata');
      }

      // Crea candidato
      const nuovoCandidato = await strapi.db.query('api::utente-candidato.utente-candidato').create({
        data: {
          Nome: nome,
          Cognome: cognome,
          Email: email,
          Password: password,
          DataDiNascita: dataDiNascita,
          Citta: citta,
          Provincia: provincia,
          Nazione: nazione,
          publishedAt: new Date()
        }
      });

      // Crea e collega pannello notifiche
      const pannello = await strapi.db.query('api::pannello-notifiche.pannello-notifiche').create({
        data: {
          utente_candidato: nuovoCandidato.id
        }
      });

      return ctx.created({ candidato: nuovoCandidato });
    } catch (err) {
      console.error('Errore durante la registrazione candidato:', err);
      return ctx.internalServerError('Errore nella registrazione');
    }
  },
};
