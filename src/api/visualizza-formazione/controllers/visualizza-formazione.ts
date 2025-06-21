'use strict';

module.exports = {
  async visualizza(ctx) {
    try {
      const [diplomi, lauree, attestati, scuole, universita] = await Promise.all([
        strapi.db.query('api::diploma.diploma').findMany(),
        strapi.db.query('api::laurea.laurea').findMany(),
        strapi.db.query('api::attestato.attestato').findMany(),
        strapi.db.query('api::scuola.scuola').findMany(),
        strapi.db.query('api::universita.universita').findMany()
      ]);

      return ctx.send({
        diplomi,
        lauree,
        attestati,
        scuole,
        universita
      });
    } catch (err) {
      console.error('Errore durante il recupero della formazione:', err);
      return ctx.internalServerError('Errore durante il recupero dei dati');
    }
  }
};
