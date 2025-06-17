'use strict';

module.exports = {
  async trova(ctx) {
    const { utenteCandidatoId } = ctx.request.body;

   if (!utenteCandidatoId) {
  return ctx.badRequest('ID candidato mancante');
}

try {
  const candidato = await strapi.db.query('api::utente-candidato.utente-candidato').findOne({
    where: { id: utenteCandidatoId },
    populate: {
      ha_diplomas: { populate: { diploma: true } },
      ha_laureas: { populate: { laurea: true } },
      ha_attestatoes: { populate: { attestato: true } },
    }
  });

  if (!candidato) return ctx.notFound('Candidato non trovato');

  const provinciaCandidato = candidato.Provincia?.toLowerCase() || '';

  const diplomaIds = candidato.ha_diplomas.map(h => h.diploma.id);
  const laureaIds = candidato.ha_laureas.map(h => h.laurea.id);
  const attestatoIds = candidato.ha_attestatoes.map(h => h.attestato.id);

  // Trova tutte le offerte e filtra manualmente per case-insensitive provincia e matching
  const tutteLeOfferte = await strapi.db.query('api::offerta.offerta').findMany({
    populate: {
      diplomas: true,
      laureas: true,
      attestatoes: true,
      quiz: true,
      utente_aziendale: {
        populate: { azienda: true }
      }
    }
  });

  const offerteCompatibili = tutteLeOfferte.filter(offerta => {
    const provinciaOfferta = offerta.Provincia?.toLowerCase() || '';

    const matchProvincia = provinciaOfferta === provinciaCandidato;

    const matchDiploma = offerta.diplomas.some(d => diplomaIds.includes(d.id));
    const matchLaurea = offerta.laureas.some(l => laureaIds.includes(l.id));
    const matchAttestato = offerta.attestatoes.some(a => attestatoIds.includes(a.id));

    return matchProvincia && (matchDiploma || matchLaurea || matchAttestato);
  });

  return ctx.send({ offerte: offerteCompatibili });

} catch (err) {
  console.error('Errore nel matching offerte:', err);
  return ctx.internalServerError('Errore interno');
}
  }
}