export default {
  async handle(ctx) {
    const { azione, utenteId, nuovoRuolo } = ctx.request.body;

    if (!azione || !utenteId) {
      return ctx.badRequest('Parametri obbligatori mancanti');
    }

    const entityService = strapi.entityService;

    try {
      const utente = await entityService.findOne('api::utente-aziendale.utente-aziendale', utenteId);

      if (!utente) {
        return ctx.notFound('Utente aziendale non trovato');
      }

      if (azione === 'modifica_ruolo') {
        if (!nuovoRuolo || !['AMMINISTRATORE', 'ORDINARIO'].includes(nuovoRuolo)) {
          return ctx.badRequest('Ruolo non valido');
        }

        const utenteAggiornato = await entityService.update('api::utente-aziendale.utente-aziendale', utenteId, {
          data: { Ruolo: nuovoRuolo },
        });

        return ctx.send({
          message: `Ruolo aggiornato a ${nuovoRuolo}`,
          utente: {
            id: utenteAggiornato.id,
            Nome: utenteAggiornato.Nome,
            Cognome: utenteAggiornato.Cognome,
            Email: utenteAggiornato.Email,
            Ruolo: utenteAggiornato.Ruolo,
          },
        });
      }

      if (azione === 'elimina') {
        await entityService.delete('api::utente-aziendale.utente-aziendale', utenteId);

        return ctx.send({
          message: 'Utente aziendale eliminato con successo',
          utenteEliminatoId: utenteId,
        });
      }

      return ctx.badRequest('Azione non riconosciuta');

    } catch (error) {
      console.error('Errore nella gestione dell\'utente aziendale:', error);
      return ctx.internalServerError('Errore interno del server');
    }
  },
};
