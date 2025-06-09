'use strict';

module.exports = {
  async registra(ctx) {
    console.log('🚀 Controller registra chiamato!');
    console.log('📝 Dati ricevuti:', ctx.request.body);

    const {
      nomeAzienda,
      partitaIva,
      citta,
      provincia,
      nazione,
      nome,
      cognome,
      email,
      password,
      dataDiNascita
    } = ctx.request.body;

    if (!nomeAzienda || !partitaIva || !email || !password || !nome || !cognome) {
      console.log('❌ Campi obbligatori mancanti');
      return ctx.badRequest('Campi obbligatori mancanti');
    }

    try {
      console.log('🔄 Inizio transazione...');
      
      // Usa EntityService invece delle transazioni complesse
      // 1. Verifica Partita IVA duplicata
      const aziendaEsistente = await strapi.entityService.findMany('api::azienda.azienda', {
        filters: { PartitaIva: partitaIva },
        limit: 1,
      });

      if (aziendaEsistente && aziendaEsistente.length > 0) {
        console.log('❌ Partita IVA già registrata');
        return ctx.conflict('Partita IVA già registrata');
      }

      // 2. Verifica email duplicata
      const utenteEsistente = await strapi.entityService.findMany('api::utente-aziendale.utente-aziendale', {
        filters: { Email: email },
        limit: 1,
      });

      if (utenteEsistente && utenteEsistente.length > 0) {
        console.log('❌ Email già registrata');
        return ctx.conflict('Email già registrata');
      }

      console.log('✅ Validazioni passate, creo azienda...');

      // 3. Crea Azienda
      const azienda = await strapi.entityService.create('api::azienda.azienda', {
        data: {
          Nome: nomeAzienda,
          PartitaIva: partitaIva,
          Citta: citta,
          Provincia: provincia,
          Nazione: nazione,
          publishedAt: new Date(),
        },
      });

      console.log('✅ Azienda creata:', azienda.id);

      // 4. Crea Referente Aziendale
      const utente = await strapi.entityService.create('api::utente-aziendale.utente-aziendale', {
        data: {
          Nome: nome,
          Cognome: cognome,
          DataDiNascita: dataDiNascita,
          Citta: citta,
          Provincia: provincia,
          Nazione: nazione,
          Email: email,
          Password: password,
          azienda: azienda.id, // Relazione con l'azienda
          Ruolo: 'REFERENTE',
          publishedAt: new Date(),
        },
      });

      console.log('✅ Utente creato:', utente.id);

      const result = { azienda, utente };
      console.log('✅ Registrazione completata con successo');
      
      return ctx.created(result);

    } catch (err) {
      console.error('❌ Errore durante la registrazione:', err);
      console.error('Stack trace:', err.stack);
      
      if (err.message && err.message.includes('Partita IVA già registrata')) {
        return ctx.conflict('Partita IVA già registrata');
      }
      if (err.message && err.message.includes('Email già registrata')) {
        return ctx.conflict('Email già registrata');
      }
      
      return ctx.internalServerError({
        message: 'Errore durante la registrazione',
        error: err.message
      });
    }
  },
};