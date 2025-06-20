'use strict';

module.exports = {
  async login(ctx) {
    const { email, password } = ctx.request.body;

    if (!email || !password) {
      return ctx.badRequest('Email e password sono obbligatori');
    }

    try {
      const utente = await strapi.db.query('api::utente-candidato.utente-candidato').findOne({
        where: { Email: email.toLowerCase() },
      });

      if (!utente) {
        return ctx.unauthorized('Credenziali non valide');
      }

      // Verifica password (assicurati che sia salvata in hash nel DB!)
      if (utente.Password !== password) {
        return ctx.unauthorized('Credenziali non valide');
      }

      // ✅ Restituisce solo i dati dell'utente senza token
      return ctx.send({
        success: true,
        user: {
          id: utente.id,
          nome: utente.Nome,
          cognome: utente.Cognome,
          email: utente.Email,
        },
      });
    } catch (error) {
      console.error('Errore nel login:', error);
      return ctx.internalServerError('Errore interno del server');
    }
  },
};