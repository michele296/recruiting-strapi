'use strict';

module.exports = {
  async calcolaCompatibilita(ctx) {
    const { offertaId, candidatoId } = ctx.params;
    
    if (!offertaId || !candidatoId) {
      return ctx.badRequest('ID offerta e candidato richiesti');
    }

    try {
      // Recupera l'offerta con i requisiti
      const offerta = await strapi.entityService.findOne('api::offerta.offerta', offertaId, {
        populate: {
          diplomas: true,
          laureas: true,
          attestatoes: true
        }
      });

      if (!offerta) {
        return ctx.notFound('Offerta non trovata');
      }

      // Recupera il candidato con la formazione
      const candidato = await strapi.entityService.findOne('api::utente-candidato.utente-candidato', candidatoId, {
        populate: {
          ha_diplomas: {
            populate: {
              diploma: true,
              scuola: true
            }
          },
          ha_laureas: {
            populate: {
              laurea: true,
              universita: true
            }
          },
          ha_attestatoes: {
            populate: {
              attestato: true
            }
          }
        }
      });

      if (!candidato) {
        return ctx.notFound('Candidato non trovato');
      }

      // Calcola il punteggio di compatibilità
      const punteggio = calcolaCompatibilitaCandidato(candidato, offerta);
      const messaggio = generaMessaggioMatching(punteggio.totale);

      return ctx.send({
        offerta_id: offertaId,
        candidato_id: candidatoId,
        punteggio_totale: punteggio.totale,
        dettagli_punteggio: punteggio.dettagli,
        messaggio: messaggio
      });

    } catch (error) {
      console.error('Errore nel calcolo compatibilità:', error);
      return ctx.internalServerError('Errore interno del server');
    }
  }
};

// Funzione per calcolare il punteggio di compatibilità
function calcolaCompatibilitaCandidato(candidato, offerta) {
  let punteggioTotale = 0;
  const dettagli = {
    punteggio_lauree: 0,
    punteggio_diplomi: 0,
    punteggio_attestati: 0,
    bonus_requisiti_specifici: 0
  };

  if (!candidato) {
    return { totale: 0, dettagli: dettagli };
  }

  // CALCOLO PUNTEGGIO LAUREE (peso: 40%)
  if (candidato.ha_laureas && candidato.ha_laureas.length > 0) {
    const laureeRichieste = offerta.laureas || [];
    let migliorVotoLaurea = 0;
    let bonusLaureaSpecifica = 0;

    candidato.ha_laureas.forEach(haLaurea => {
      const voto = haLaurea.voto || 0;
      const laureaId = haLaurea.laurea?.id;
      
      const isLaureaRichiesta = laureeRichieste.some(laurea => laurea.id === laureaId);
      if (isLaureaRichiesta) {
        bonusLaureaSpecifica = Math.max(bonusLaureaSpecifica, voto * 0.3);
      }
      migliorVotoLaurea = Math.max(migliorVotoLaurea, voto);
    });

    const votoNormalizzato = Math.max(0, (migliorVotoLaurea - 66) / (110 - 66));
    dettagli.punteggio_lauree = (votoNormalizzato * 40) + bonusLaureaSpecifica;
  }

  // CALCOLO PUNTEGGIO DIPLOMI (peso: 30%)
  if (candidato.ha_diplomas && candidato.ha_diplomas.length > 0) {
    const diplomiRichiesti = offerta.diplomas || [];
    let migliorVotoDiploma = 0;
    let bonusDiplomaSpecifico = 0;

    candidato.ha_diplomas.forEach(haDiploma => {
      const voto = haDiploma.voto || 0;
      const diplomaId = haDiploma.diploma?.id;
      
      const isDiplomaRichiesto = diplomiRichiesti.some(diploma => diploma.id === diplomaId);
      if (isDiplomaRichiesto) {
        bonusDiplomaSpecifico = Math.max(bonusDiplomaSpecifico, voto * 0.2);
      }
      migliorVotoDiploma = Math.max(migliorVotoDiploma, voto);
    });

    const votoNormalizzato = Math.max(0, (migliorVotoDiploma - 60) / (100 - 60));
    dettagli.punteggio_diplomi = (votoNormalizzato * 30) + bonusDiplomaSpecifico;
  }

  // CALCOLO PUNTEGGIO ATTESTATI (peso: 20%)
  if (candidato.ha_attestatoes && candidato.ha_attestatoes.length > 0) {
    const attestatiRichiesti = offerta.attestatoes || [];
    const numeroAttestati = candidato.ha_attestatoes.length;
    let bonusAttestatoSpecifico = 0;

    candidato.ha_attestatoes.forEach(haAttestato => {
      const attestatoId = haAttestato.attestato?.id;
      const isAttestatoRichiesto = attestatiRichiesti.some(attestato => attestato.id === attestatoId);
      if (isAttestatoRichiesto) {
        bonusAttestatoSpecifico += 5;
      }
    });

    const punteggioBase = Math.min(20, numeroAttestati * 2);
    dettagli.punteggio_attestati = punteggioBase + bonusAttestatoSpecifico;
  }

  // BONUS AGGIUNTIVI (peso: 10%)
  let bonusExtra = 0;
  const haLaureaRichiesta = !offerta.laureas?.length || candidato.ha_laureas?.some(hl => offerta.laureas.some(ol => ol.id === hl.laurea?.id));
  const haDiplomaRichiesto = !offerta.diplomas?.length || candidato.ha_diplomas?.some(hd => offerta.diplomas.some(od => od.id === hd.diploma?.id));
  const haAttestatoRichiesto = !offerta.attestatoes?.length || candidato.ha_attestatoes?.some(ha => offerta.attestatoes.some(oa => oa.id === ha.attestato?.id));

  if (haLaureaRichiesta && haDiplomaRichiesto && haAttestatoRichiesto) {
    bonusExtra += 10;
  }
  if (haLaureaRichiesta) bonusExtra += 3;
  if (haDiplomaRichiesto) bonusExtra += 2;
  if (haAttestatoRichiesto) bonusExtra += 2;

  dettagli.bonus_requisiti_specifici = bonusExtra;
  punteggioTotale = dettagli.punteggio_lauree + dettagli.punteggio_diplomi + dettagli.punteggio_attestati + dettagli.bonus_requisiti_specifici;

  return {
    totale: Math.round(punteggioTotale * 100) / 100,
    dettagli: dettagli
  };
}

// Funzione per generare messaggio di matching
function generaMessaggioMatching(punteggio) {
  if (punteggio >= 100) {
    return "Eccellente compatibilità! Il tuo profilo è perfetto per questa posizione.";
  } else if (punteggio >= 80) {
    return "Buona compatibilità. Hai molti dei requisiti richiesti per questa posizione.";
  } else if (punteggio >= 50) {
    return "Compatibilità media. Potresti essere considerato ma mancano alcuni requisiti.";
  } else if (punteggio >= 20) {
    return "Bassa compatibilità. Il tuo profilo non corrisponde molto ai requisiti richiesti.";
  } else {
    return "Compatibilità molto bassa. Questa posizione potrebbe non essere adatta al tuo profilo.";
  }
}