/**
 * A set of functions called "actions" for `cambia-password`
 */

export default {
  cambiaPassword: async (ctx, next) => {
    try {
      const { email, vecchiaPassword, nuovaPassword } = ctx.request.body;
      
      if (!email || !vecchiaPassword || !nuovaPassword) {
        return ctx.badRequest('Email, vecchia password e nuova password sono obbligatori');
      }
      
      // Cerca candidato
      const candidato = await strapi.db.query('api::utente-candidato.utente-candidato').findOne({
        where: { Email: email }
      });
      
      if (candidato) {
        if (candidato.Password !== vecchiaPassword) {
          return ctx.badRequest('Vecchia password non corretta');
        }
        
        await strapi.db.query('api::utente-candidato.utente-candidato').update({
          where: { id: candidato.id },
          data: { Password: nuovaPassword }
        });
        
        return ctx.send({ message: 'Password candidato aggiornata con successo' });
      }
      
      // Cerca utente aziendale
      const utenteAziendale = await strapi.db.query('api::utente-aziendale.utente-aziendale').findOne({
        where: { Email: email }
      });
      
      if (utenteAziendale) {
        if (utenteAziendale.Password !== vecchiaPassword) {
          return ctx.badRequest('Vecchia password non corretta');
        }
        
        await strapi.db.query('api::utente-aziendale.utente-aziendale').update({
          where: { id: utenteAziendale.id },
          data: { Password: nuovaPassword }
        });
        
        return ctx.send({ message: 'Password utente aziendale aggiornata con successo' });
      }
      
      return ctx.notFound('Utente non trovato');
      
    } catch (err) {
      console.error('Errore cambio password:', err);
      return ctx.internalServerError('Errore interno del server');
    }
  }
};
