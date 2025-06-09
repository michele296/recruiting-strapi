//login-utente-candidato.js//
'use strict';

const jwt = require('jsonwebtoken');

module.exports = {
  async login(ctx) {
    const { email, password } = ctx.request.body;

    if (!email || !password) {
      return ctx.badRequest('Email e password sono obbligatori');
    }

    const utente = await strapi.db.query('api::utente-candidato.utente-candidato').findOne({
      where: { Email: email },
    });

    if (!utente) {
      return ctx.unauthorized('Credenziali non valide');
    }

    // Verifica password (assicurati che sia salvata in hash nel DB!)
    if (utente.Password !== password) {
      return ctx.unauthorized('Credenziali non valide');
    }

    // ✅ Crea JWT
    const token = strapi.plugins['users-permissions'].services.jwt.issue({
      id: utente.id,
      email: utente.Email,
      ruolo: 'candidato',
    });

    return ctx.send({
      jwt: token,
      user: {
        id: utente.id,
        nome: utente.Nome,
        cognome: utente.Cognome,
        email: utente.Email,
      },
    });
  },
};
