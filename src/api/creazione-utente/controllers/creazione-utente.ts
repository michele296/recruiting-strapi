'use strict';

export default {
  async create(ctx) {
    const {
      Nome,
      Cognome,
      Email,
      Ruolo,
      Provincia,
      Citta,
      Nazione,
      DataDiNascita,
      aziendaId,
    } = ctx.request.body;

    if (!Nome?.trim() || !Cognome?.trim() || !Email?.trim() || !Ruolo?.trim() || !aziendaId) {
      return ctx.badRequest('Parametri obbligatori mancanti');
    }

    const ruoloNormalizzato = Ruolo.toUpperCase();

    if (!['AMMINISTRATORE', 'ORDINARIO'].includes(ruoloNormalizzato)) {
      return ctx.badRequest("Ruolo non valido. Deve essere 'AMMINISTRATORE' o 'ORDINARIO'");
    }

    const cognomeLower = Cognome.toLowerCase();
    const password =
      ruoloNormalizzato === 'AMMINISTRATORE'
        ? `${cognomeLower}amministratore.2025`
        : `${cognomeLower}ordinario.2025`;

    try {
      const nuovoUtente = await strapi.entityService.create('api::utente-aziendale.utente-aziendale', {
        data: {
          Nome,
          Cognome,
          Email,
          Ruolo: ruoloNormalizzato,
          Provincia: Provincia || null,
          Citta: Citta || null,
          Nazione: Nazione || null,
          DataDiNascita: DataDiNascita || null,
          Password: password,
          azienda: aziendaId,
        },
        populate: ['azienda'],
      });

      return ctx.send({
        message: 'Utente aziendale creato con successo',
        utente: nuovoUtente,
        passwordGenerata: password,
      });
    } catch (err) {
      console.error('Errore nella creazione utente:', err);
      return ctx.internalServerError("Errore nella creazione dell'utente");
    }
  },
};
