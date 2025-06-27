'use strict';

module.exports = {
  async inserisciCV(ctx) {
    const { candidatoId } = ctx.params;
    
    if (!candidatoId) {
      return ctx.badRequest('ID candidato mancante');
    }

    try {
      const candidato = await strapi.db.query('api::utente-candidato.utente-candidato').findOne({
        where: { id: candidatoId }
      });

      if (!candidato) {
        return ctx.notFound('Candidato non trovato');
      }

      const { github, linkedin, altri_link } = ctx.request.body;
      const updateData: any = {};

      // Gestisci upload CV se presente
      const files = ctx.request.files;
      if (files && files.cv) {
        const uploadedFiles = await strapi.plugins.upload.services.upload.upload({
          data: {},
          files: files.cv
        });
        updateData.CV = uploadedFiles[0].id;
      }

      // Gestisci i link
      if (github !== undefined) updateData.github = github;
      if (linkedin !== undefined) updateData.linkedin = linkedin;
      if (altri_link !== undefined) updateData.altri_link = altri_link;

      await strapi.db.query('api::utente-candidato.utente-candidato').update({
        where: { id: candidatoId },
        data: updateData
      });

      return ctx.send({
        message: 'Dati aggiornati con successo',
        data: updateData
      });

    } catch (error) {
      console.error('Errore aggiornamento dati:', error);
      return ctx.internalServerError('Errore nell\'aggiornamento dei dati');
    }
  }
};
