'use strict';

const bcrypt = require('bcryptjs');

module.exports = {
  async login(ctx) {
    console.log('🔐 Tentativo di login per:', ctx.request.body.email);
    
    const { email, password } = ctx.request.body;
    
    if (!email || !password) {
      console.log('❌ Email o password mancanti');
      return ctx.badRequest('Email e password sono obbligatori');
    }

    try {
      // Trova l'utente con l'azienda
      const utente = await strapi.db.query('api::utente-aziendale.utente-aziendale').findOne({
        where: { Email: email },
        populate: { azienda: true }
      });

      if (!utente) {
        console.log('❌ Utente non trovato per email:', email);
        return ctx.unauthorized('Credenziali non valide');
      }

      console.log('✅ Utente trovato:', utente.Nome);
      console.log('🔍 Password salvata (hash):', utente.Password);
      console.log('🔍 Password inserita:', password);

      // Verifica password
      let passwordValida = false;
      
      // Prova prima con bcrypt (se la password è hashata)
      try {
        passwordValida = await bcrypt.compare(password, utente.Password);
        console.log('🔐 Risultato bcrypt compare:', passwordValida);
      } catch (bcryptError) {
        console.log('⚠️ Errore bcrypt, provo confronto diretto');
        // Se bcrypt fallisce, prova confronto diretto (per password in chiaro)
        passwordValida = utente.Password === password;
        console.log('🔍 Risultato confronto diretto:', passwordValida);
      }

      if (!passwordValida) {
        console.log('❌ Password non valida');
        return ctx.unauthorized('Credenziali non valide');
      }

      console.log('✅ Login riuscito per:', utente.Nome);

      return ctx.send({
        success: true,
        user: {
          id: utente.id,
          nome: utente.Nome,
          cognome: utente.Cognome,
          email: utente.Email,
          ruolo: utente.Ruolo,
          azienda: utente.azienda,
          aziendaId: utente.azienda?.id
        }
      });

    } catch (error) {
      console.error('❌ Errore durante il login:', error);
      return ctx.internalServerError('Errore interno del server');
    }
  },
};