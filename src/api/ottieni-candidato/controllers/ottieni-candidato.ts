import { Context } from 'koa';

export default {
  async find(ctx: Context) {
    const candidatoId = ctx.params.id;

    if (!candidatoId) {
      return ctx.badRequest('ID candidato mancante');
    }

    try {
      const candidato = await strapi.db.query('api::utente-candidato.utente-candidato').findOne({
        where: { id: parseInt(candidatoId) },
        populate: {
          ha_diplomas: {
            populate: {
              diploma: true,
              scuola: true,
            },
          },
          ha_laureas: {
            populate: {
              laurea: true,
              universita: true,
            },
          },
          ha_attestatoes: {
            populate: {
              attestato: true,
            },
          },
        },
      });

      if (!candidato) {
        return ctx.notFound('Candidato non trovato');
      }

      return ctx.send({
        message: 'Candidato trovato',
        candidato,
      });
    } catch (error) {
      console.error('Errore recupero candidato:', error);
      return ctx.internalServerError('Errore nel recupero del candidato');
    }
  },
};
