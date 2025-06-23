import { Context } from 'koa';

export default {
  async update(ctx: Context) {
    const { aziendaId } = ctx.params;
    const {
      Descrizione,
      valori_aziendali,
      numero_dipendenti,
      email_contatto,
    } = ctx.request.body;

    if (!aziendaId) {
      return ctx.badRequest('ID Azienda mancante');
    }

    // Validazioni semplici (esempio)
    if (
      (numero_dipendenti && typeof numero_dipendenti !== 'number') ||
      (email_contatto && typeof email_contatto !== 'string')
    ) {
      return ctx.badRequest('Campi con formato errato');
    }

    try {
      // Aggiorna solo i campi forniti
      const updateData: any = {};
      if (Descrizione !== undefined) updateData.Descrizione = Descrizione;
      if (valori_aziendali !== undefined) updateData.valori_aziendali = valori_aziendali;
      if (numero_dipendenti !== undefined) updateData.numero_dipendenti = numero_dipendenti;
      if (email_contatto !== undefined) updateData.email_contatto = email_contatto;

      const aziendaAggiornata = await strapi.db.query('api::azienda.azienda').update({
        where: { id: parseInt(aziendaId, 10) },
        data: updateData,
      });

      return ctx.send({
        message: 'Profilo aziendale aggiornato con successo',
        azienda: aziendaAggiornata,
      });
    } catch (err) {
      console.error('Errore aggiornamento profilo aziendale:', err);
      return ctx.internalServerError('Errore durante l\'aggiornamento');
    }
  },
};
