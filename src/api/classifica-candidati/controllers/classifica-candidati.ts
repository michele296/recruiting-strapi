// src/api/classifica-candidati/controllers/classifica-candidati.js

'use strict';

module.exports = {
  async classificaCandidati(ctx) {
    try {
      const { offertaId } = ctx.params;

      if (!offertaId) {
        return ctx.badRequest('ID offerta richiesto');
      }

      // Recupera l'offerta con le relazioni necessarie - POPULATE COMPLETO
      const offerta = await strapi.entityService.findOne('api::offerta.offerta', offertaId, {
        populate: {
          diplomas: {
            populate: '*'
          },
          laureas: {
            populate: '*'
          },
          attestatoes: {
            populate: '*'
          }
        }
      });

      if (!offerta) {
        return ctx.notFound('Offerta non trovata');
      }

      console.log('OFFERTA RECUPERATA:', JSON.stringify(offerta, null, 2));

      // Recupera tutte le candidature per questa offerta con i candidati - POPULATE COMPLETO
      const candidature = await strapi.entityService.findMany('api::candidatura.candidatura', {
        filters: {
          offerta: {
            id: offertaId
          }
        },
        populate: {
          utente_candidato: {
            populate: {
              ha_diplomas: {
                populate: {
                  diploma: {
                    populate: '*'
                  },
                  scuola: {
                    populate: '*'
                  }
                }
              },
              ha_laureas: {
                populate: {
                  laurea: {
                    populate: '*'
                  },
                  universita: {
                    populate: '*'
                  }
                }
              },
              ha_attestatoes: {
                populate: {
                  attestato: {
                    populate: '*'
                  }
                }
              }
            }
          }
        }
      });

      console.log('CANDIDATURE RECUPERATE:', JSON.stringify(candidature, null, 2));

      // Calcola il punteggio per ogni candidato
      const candidatiConPunteggio = candidature.map((candidatura) => {
        const candidato = candidatura['utente_candidato'];
        console.log(`\n=== ELABORANDO CANDIDATO: ${candidato?.Nome} ${candidato?.Cognome} ===`);
        
        const punteggio = calcolaPunteggio(candidato, offerta);
        
        const candidatoConPunteggio = {
          candidatura_id: candidatura.id,
          candidato_id: candidato?.id,
          nome: candidato?.Nome,
          cognome: candidato?.Cognome,
          email: candidato?.Email,
          punteggio_totale: punteggio.totale,
          dettagli_punteggio: punteggio.dettagli,
          stato_candidatura: candidatura.Stato,
          data_candidatura: candidatura.data_candidatura,
          posizione: 0 // Verrà impostata dopo l'ordinamento
        };
        
        return candidatoConPunteggio;
      });

      // Ordina per punteggio decrescente
      candidatiConPunteggio.sort((a, b) => b.punteggio_totale - a.punteggio_totale);

      // Aggiungi posizione in classifica
      candidatiConPunteggio.forEach((candidato, index) => {
        candidato.posizione = index + 1;
      });

      return ctx.send({
        offerta_id: offertaId,
        offerta_info: {
          tipo_contratto: offerta.tipo_contratto,
          stipendio: offerta.stipendio,
          provincia: offerta.Provincia
        },
        totale_candidati: candidatiConPunteggio.length,
        classifica: candidatiConPunteggio
      });

    } catch (error) {
      console.error('Errore nella classifica candidati:', error);
      return ctx.internalServerError('Errore interno del server');
    }
  },

  // Funzione di health check per evitare che Strapi si chiuda
  async healthCheck(ctx) {
    return ctx.send({ status: 'OK', timestamp: new Date().toISOString() });
  }
  }


// Funzione per calcolare il punteggio di compatibilità
function calcolaPunteggio(candidato, offerta) {
  let punteggioTotale = 0;
  const dettagli = {
    punteggio_lauree: 0,
    punteggio_diplomi: 0,
    punteggio_attestati: 0,
    bonus_requisiti_specifici: 0
  };

  // Controllo sicurezza per candidato
  if (!candidato) {
    console.log('CANDIDATO NULLO - Ritorno punteggio 0');
    return {
      totale: 0,
      dettagli: dettagli
    };
  }

  // Debug: Stampa tutti i dati disponibili
  console.log('CANDIDATO DATI:', {
    id: candidato.id,
    nome: candidato.Nome,
    cognome: candidato.Cognome,
    ha_laureas: candidato.ha_laureas?.length || 0,
    ha_diplomas: candidato.ha_diplomas?.length || 0,
    ha_attestatoes: candidato.ha_attestatoes?.length || 0
  });

  console.log('OFFERTA REQUISITI:', {
    laureas: offerta.laureas?.length || 0,
    diplomas: offerta.diplomas?.length || 0,
    attestatoes: offerta.attestatoes?.length || 0
  });

  // CALCOLO PUNTEGGIO LAUREE (peso: 40%)
  if (candidato.ha_laureas && candidato.ha_laureas.length > 0) {
    const laureeRichieste = offerta.laureas || [];
    let migliorVotoLaurea = 0;
    let bonusLaureaSpecifica = 0;

    console.log('LAUREE RICHIESTE DALL\'OFFERTA:');
    laureeRichieste.forEach(laurea => {
      console.log(`  - ID: ${laurea.id}, Nome: ${laurea.nome || 'N/A'}`);
    });

    console.log('LAUREE DEL CANDIDATO:');
    candidato.ha_laureas.forEach(haLaurea => {
      const voto = haLaurea.voto || 0;
      const laureaId = haLaurea.laurea?.id;
      const laureaNome = haLaurea.laurea?.nome || 'N/A';
      
      console.log(`  - Laurea ID: ${laureaId}, Nome: ${laureaNome}, Voto: ${voto}`);
      
      // Controlla se è una laurea richiesta dall'offerta
      const isLaureaRichiesta = laureeRichieste.some(laurea => {
        const match = laurea.id === laureaId;
        console.log(`    Confronto: ${laurea.id} === ${laureaId} = ${match}`);
        return match;
      });

      console.log(`    Laurea richiesta: ${isLaureaRichiesta}`);

      if (isLaureaRichiesta) {
        const bonus = voto * 0.3;
        bonusLaureaSpecifica = Math.max(bonusLaureaSpecifica, bonus);
        console.log(`    BONUS LAUREA SPECIFICA: ${bonus}`);
      }
      
      migliorVotoLaurea = Math.max(migliorVotoLaurea, voto);
    });

    // Normalizza il voto (assumendo voti da 66 a 110)
    const votoNormalizzato = Math.max(0, (migliorVotoLaurea - 66) / (110 - 66));
    dettagli.punteggio_lauree = (votoNormalizzato * 40) + bonusLaureaSpecifica;
    
    console.log(`PUNTEGGIO LAUREE: Base=${votoNormalizzato * 40}, Bonus=${bonusLaureaSpecifica}, Totale=${dettagli.punteggio_lauree}`);
  }

  // CALCOLO PUNTEGGIO DIPLOMI (peso: 30%)
  if (candidato.ha_diplomas && candidato.ha_diplomas.length > 0) {
    const diplomiRichiesti = offerta.diplomas || [];
    let migliorVotoDiploma = 0;
    let bonusDiplomaSpecifico = 0;

    console.log('DIPLOMI RICHIESTI DALL\'OFFERTA:');
    diplomiRichiesti.forEach(diploma => {
      console.log(`  - ID: ${diploma.id}, Nome: ${diploma.nome || 'N/A'}`);
    });

    console.log('DIPLOMI DEL CANDIDATO:');
    candidato.ha_diplomas.forEach(haDiploma => {
      const voto = haDiploma.voto || 0;
      const diplomaId = haDiploma.diploma?.id;
      const diplomaNome = haDiploma.diploma?.nome || 'N/A';
      
      console.log(`  - Diploma ID: ${diplomaId}, Nome: ${diplomaNome}, Voto: ${voto}`);
      
      // Controlla se è un diploma richiesto dall'offerta
      const isDiplomaRichiesto = diplomiRichiesti.some(diploma => {
        const match = diploma.id === diplomaId;
        console.log(`    Confronto: ${diploma.id} === ${diplomaId} = ${match}`);
        return match;
      });

      console.log(`    Diploma richiesto: ${isDiplomaRichiesto}`);

      if (isDiplomaRichiesto) {
        const bonus = voto * 0.2;
        bonusDiplomaSpecifico = Math.max(bonusDiplomaSpecifico, bonus);
        console.log(`    BONUS DIPLOMA SPECIFICO: ${bonus}`);
      }
      
      migliorVotoDiploma = Math.max(migliorVotoDiploma, voto);
    });

    // Normalizza il voto (assumendo voti da 60 a 100)
    const votoNormalizzato = Math.max(0, (migliorVotoDiploma - 60) / (100 - 60));
    dettagli.punteggio_diplomi = (votoNormalizzato * 30) + bonusDiplomaSpecifico;
    
    console.log(`PUNTEGGIO DIPLOMI: Base=${votoNormalizzato * 30}, Bonus=${bonusDiplomaSpecifico}, Totale=${dettagli.punteggio_diplomi}`);
  }

  // CALCOLO PUNTEGGIO ATTESTATI (peso: 20%)
  if (candidato.ha_attestatoes && candidato.ha_attestatoes.length > 0) {
    const attestatiRichiesti = offerta.attestatoes || [];
    const numeroAttestati = candidato.ha_attestatoes.length;
    let bonusAttestatoSpecifico = 0;

    console.log('ATTESTATI RICHIESTI DALL\'OFFERTA:');
    attestatiRichiesti.forEach(attestato => {
      console.log(`  - ID: ${attestato.id}, Nome: ${attestato.nome || 'N/A'}`);
    });

    console.log('ATTESTATI DEL CANDIDATO:');
    // Verifica se ha attestati specifici richiesti
    candidato.ha_attestatoes.forEach(haAttestato => {
      const attestatoId = haAttestato.attestato?.id;
      const attestatoNome = haAttestato.attestato?.nome || 'N/A';
      const livello = haAttestato.livello || 'N/A';
      
      console.log(`  - Attestato ID: ${attestatoId}, Nome: ${attestatoNome}, Livello: ${livello}`);
      
      const isAttestatoRichiesto = attestatiRichiesti.some(attestato => {
        const match = attestato.id === attestatoId;
        console.log(`    Confronto: ${attestato.id} === ${attestatoId} = ${match}`);
        return match;
      });

      console.log(`    Attestato richiesto: ${isAttestatoRichiesto}`);

      if (isAttestatoRichiesto) {
        bonusAttestatoSpecifico += 5; // 5 punti per ogni attestato specifico
        console.log(`    BONUS ATTESTATO SPECIFICO: +5 (totale: ${bonusAttestatoSpecifico})`);
      }
    });

    // Punteggio base per numero di attestati (max 20 punti)
    const punteggioBase = Math.min(20, numeroAttestati * 2);
    dettagli.punteggio_attestati = punteggioBase + bonusAttestatoSpecifico;
    
    console.log(`PUNTEGGIO ATTESTATI: Base=${punteggioBase}, Bonus=${bonusAttestatoSpecifico}, Totale=${dettagli.punteggio_attestati}`);
  }

  // BONUS AGGIUNTIVI (peso: 10%)
  let bonusExtra = 0;

  // Bonus per avere tutti i requisiti specifici dell'offerta
  const haLaureaRichiesta = !offerta.laureas?.length || 
    candidato.ha_laureas?.some(hl => {
      const hasMatch = offerta.laureas.some(ol => ol.id === hl.laurea?.id);
      console.log(`Verifica laurea richiesta: ${hasMatch}`);
      return hasMatch;
    });

  const haDiplomaRichiesto = !offerta.diplomas?.length || 
    candidato.ha_diplomas?.some(hd => {
      const hasMatch = offerta.diplomas.some(od => od.id === hd.diploma?.id);
      console.log(`Verifica diploma richiesto: ${hasMatch}`);
      return hasMatch;
    });

  const haAttestatoRichiesto = !offerta.attestatoes?.length || 
    candidato.ha_attestatoes?.some(ha => {
      const hasMatch = offerta.attestatoes.some(oa => oa.id === ha.attestato?.id);
      console.log(`Verifica attestato richiesto: ${hasMatch}`);
      return hasMatch;
    });

  console.log(`VERIFICA COMPLETEZZA: Laurea=${haLaureaRichiesta}, Diploma=${haDiplomaRichiesto}, Attestato=${haAttestatoRichiesto}`);

  // Bonus per completezza (tutti i requisiti)
  if (haLaureaRichiesta && haDiplomaRichiesto && haAttestatoRichiesto) {
    bonusExtra += 10; // Bonus per completezza
    console.log('BONUS COMPLETEZZA: +10 punti');
  }

  // Bonus parziali per singoli requisiti soddisfatti
  if (haLaureaRichiesta) {
    bonusExtra += 3; // Bonus per avere laurea richiesta
    console.log('BONUS LAUREA RICHIESTA: +3 punti');
  }
  
  if (haDiplomaRichiesto) {
    bonusExtra += 2; // Bonus per avere diploma richiesto
    console.log('BONUS DIPLOMA RICHIESTO: +2 punti');
  }
  
  if (haAttestatoRichiesto) {
    bonusExtra += 2; // Bonus per avere attestato richiesto
    console.log('BONUS ATTESTATO RICHIESTO: +2 punti');
  }

  dettagli.bonus_requisiti_specifici = bonusExtra;
  console.log(`BONUS TOTALI REQUISITI SPECIFICI: ${bonusExtra}`);

  // CALCOLO TOTALE
  punteggioTotale = dettagli.punteggio_lauree + dettagli.punteggio_diplomi + 
                   dettagli.punteggio_attestati + dettagli.bonus_requisiti_specifici;

  console.log(`PUNTEGGIO FINALE: ${punteggioTotale}`);
  console.log('DETTAGLI FINALI:', dettagli);

  return {
    totale: Math.round(punteggioTotale * 100) / 100, // Arrotonda a 2 decimali
    dettagli: dettagli
  };
}