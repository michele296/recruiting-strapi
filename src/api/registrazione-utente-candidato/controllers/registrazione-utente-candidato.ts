//registrazione-utente-candidato//
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
      // Verifica email univoca
      const candidatoEsistente = await strapi.db.query('api::utente-candidato.utente-candidato').findOne({
        where: { Email: email },
      });

      if (candidatoEsistente) {
        return ctx.conflict('Email già registrata');
      }

      // Crea candidato
      const candidato = await strapi.db.query('api::utente-candidato.utente-candidato').create({
        data: {
          Nome: nome,
          Cognome: cognome,
          Email: email,
          Password: password, // (da criptare in futuro)
          DataDiNascita: dataDiNascita,
          Citta: citta,
          Provincia: provincia,
          Nazione: nazione,
          publishedAt: new Date()
        }
      });

      return ctx.created({ candidato });

    } catch (err) {
      console.error('Errore durante la registrazione candidato:', err);
      return ctx.internalServerError('Errore nella registrazione');
    }
  },
};