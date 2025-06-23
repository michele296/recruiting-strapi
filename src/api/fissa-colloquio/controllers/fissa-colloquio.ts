import { Context } from 'koa';

export default {
  async updateColloquio(ctx: Context) {
    const { candidaturaId, data_colloquio, info_colloquio, utenteAziendaleId } = ctx.request.body;

    if (!candidaturaId || !data_colloquio || !info_colloquio || !utenteAziendaleId) {
      return ctx.badRequest('Parametri obbligatori mancanti');
    }

    // 1. Verifica l'utente aziendale
    const utente = await strapi.db.query('api::utente-aziendale.utente-aziendale').findOne({
      where: { id: utenteAziendaleId },
    });

    if (!utente || (utente.Ruolo !== 'AMMINISTRATORE' && utente.Ruolo !== 'REFERENTE')) {
      return ctx.unauthorized('Utente non autorizzato');
    }

    // 2. Recupera la candidatura con utente candidato
    const candidatura = await strapi.db.query('api::candidatura.candidatura').findOne({
      where: { id: candidaturaId },
      populate: { utente_candidato: { populate: { pannello_notifiche: true } } },
    });

    if (!candidatura) return ctx.notFound('Candidatura non trovata');

    const candidato = candidatura.utente_candidato;
    if (!candidato) return ctx.notFound('Candidato non trovato nella candidatura');

    const pannelloNotifiche = candidato.pannello_notifiche;
    if (!pannelloNotifiche) return ctx.badRequest('Il candidato non ha un pannello notifiche associato');

    // 3. Format info colloquio
    const infoFinale = `${utente.Email}\n${info_colloquio}`;

    // 4. Aggiorna la candidatura
    const candidaturaAggiornata = await strapi.entityService.update('api::candidatura.candidatura', candidaturaId, {
      data: {
        data_colloquio,
        info_colloquio: infoFinale,
      },
    });

    // 5. Crea la notifica
    await strapi.entityService.create('api::notifica.notifica', {
      data: {
        titolo: 'Colloquio programmato',
        messaggio: `Hai un colloquio fissato il ${new Date(data_colloquio).toLocaleString()}. Controlla le informazioni nella tua area personale.`,
        letto: false,
        data_invio: new Date(),
        pannello_notifiche: pannelloNotifiche.id,
      },
    });

    // 6. Risposta
    return ctx.send({
      message: 'Colloquio aggiornato con successo e notifica inviata al candidato',
      candidaturaAggiornata,
    });
  },
};
