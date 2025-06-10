// services/api.js
const API_BASE_URL = 'http://localhost:1337/api';

// Registrazione Azienda
export const registraAzienda = async (datiAzienda) => {
  try {
    const response = await fetch(`${API_BASE_URL}/registra-azienda/registra`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(datiAzienda),
    });

    if (!response.ok) {
      // Controlla se la risposta è JSON prima di cercare di parsarla
      const contentType = response.headers.get('content-type');
      let errorMessage = `Errore HTTP: ${response.status} ${response.statusText}`;
      
      if (contentType && contentType.includes('application/json')) {
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (jsonError) {
          // Se il parsing JSON fallisce, usa il messaggio di default
        }
      }
      
      throw new Error(errorMessage);
    }

    return await response.json();
  } catch (error) {
    console.error('Errore nella registrazione azienda:', error);
    throw error;
  }
};

// Login Utente Aziendale
export const loginUtenteAziendale = async (credenziali) => {
  try {
    const response = await fetch(`${API_BASE_URL}/login-utente-aziendale/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credenziali),
    });

    if (!response.ok) {
      const contentType = response.headers.get('content-type');
      let errorMessage = `Errore HTTP: ${response.status} ${response.statusText}`;
      
      if (contentType && contentType.includes('application/json')) {
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (jsonError) {
          // Se il parsing JSON fallisce, usa il messaggio di default
        }
      }
      
      throw new Error(errorMessage);
    }

    return await response.json();
  } catch (error) {
    console.error('Errore nel login aziendale:', error);
    throw error;
  }
};

// Registrazione Candidato
export const registraCandidato = async (datiCandidato) => {
  try {
    const response = await fetch(`${API_BASE_URL}/registrazione-utente-candidato/registra`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(datiCandidato),
    });

    if (!response.ok) {
      const contentType = response.headers.get('content-type');
      let errorMessage = `Errore HTTP: ${response.status} ${response.statusText}`;
      
      if (contentType && contentType.includes('application/json')) {
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (jsonError) {
          // Se il parsing JSON fallisce, usa il messaggio di default
        }
      }
      
      throw new Error(errorMessage);
    }

    return await response.json();
  } catch (error) {
    console.error('Errore nella registrazione candidato:', error);
    throw error;
  }
};

// Login Utente Candidato
export const loginUtenteCandidato = async (credenziali) => {
  try {
    const response = await fetch(`${API_BASE_URL}/login-utente-candidato/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credenziali),
    });

    if (!response.ok) {
      const contentType = response.headers.get('content-type');
      let errorMessage = `Errore HTTP: ${response.status} ${response.statusText}`;
      
      if (contentType && contentType.includes('application/json')) {
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (jsonError) {
          // Se il parsing JSON fallisce, usa il messaggio di default
        }
      }

      throw new Error(errorMessage);
    }

    // ✅ Parsing della risposta
    const data = await response.json();

    // ✅ Debug (puoi rimuoverlo dopo)
    console.log('Login API response:', data);

    // ⚠️ IMPORTANTE: assicurati che `data.jwt` e `data.user` esistano
    return data;

  } catch (error) {
    console.error('Errore nella loginUtenteCandidato:', error);
    throw error;
  }
};


// ===== FUNZIONI PER GESTIONE COMPETENZE =====

// Ottieni profilo candidato
export const getCandidatoProfile = async (candidatoId) => {
  try {
     const token = localStorage.getItem('jwt'); // o dove hai salvato il token
    const response = await fetch(`${API_BASE_URL}/utente-candidatoes/${candidatoId}?populate=*`, {
      method: 'GET',
      headers: {
         'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Errore HTTP: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Errore nel caricamento profilo candidato:', error);
    throw error;
  }
};

// Ottieni indirizzi scolastici
export const getIndirizziScolastici = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/indirizzo-scolasticoes`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Errore HTTP: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Errore nel caricamento indirizzi scolastici:', error);
    throw error;
  }
};

// Ottieni scuole per indirizzo
export const getScuoleByIndirizzo = async (indirizzoId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/indirizzo-scolasticoes/${indirizzoId}?populate[scuolas][populate]=*`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Errore HTTP: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return { data: data.data.attributes.scuolas.data || [] };
  } catch (error) {
    console.error('Errore nel caricamento scuole:', error);
    throw error;
  }
};

// Ottieni lauree
export const getLauree = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/laureas`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Errore HTTP: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Errore nel caricamento lauree:', error);
    throw error;
  }
};

// Ottieni università per laurea
export const getUniversitaByLaurea = async (laureaId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/laureas/${laureaId}?populate[universitas][populate]=*`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Errore HTTP: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return { data: data.data.attributes.universitas.data || [] };
  } catch (error) {
    console.error('Errore nel caricamento università:', error);
    throw error;
  }
};

// Ottieni attestati
export const getAttestati = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/attestatoes`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Errore HTTP: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Errore nel caricamento attestati:', error);
    throw error;
  }
};

// ===== GESTIONE DIPLOMA =====

// Aggiungi diploma
export const aggiungiDiploma = async (datiDiploma) => {
  try {
    const response = await fetch(`${API_BASE_URL}/gestione-diploma/aggiungi`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(datiDiploma),
    });

    if (!response.ok) {
      const contentType = response.headers.get('content-type');
      let errorMessage = `Errore HTTP: ${response.status} ${response.statusText}`;
      
      if (contentType && contentType.includes('application/json')) {
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (jsonError) {
          // Se il parsing JSON fallisce, usa il messaggio di default
        }
      }
      
      throw new Error(errorMessage);
    }

    return await response.json();
  } catch (error) {
    console.error('Errore nell\'aggiunta diploma:', error);
    throw error;
  }
};

// Modifica diploma
export const modificaDiploma = async (candidatoId, datiDiploma) => {
  try {
    const response = await fetch(`${API_BASE_URL}/gestione-diploma/modifica/${candidatoId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(datiDiploma),
    });

    if (!response.ok) {
      const contentType = response.headers.get('content-type');
      let errorMessage = `Errore HTTP: ${response.status} ${response.statusText}`;
      
      if (contentType && contentType.includes('application/json')) {
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (jsonError) {
          // Se il parsing JSON fallisce, usa il messaggio di default
        }
      }
      
      throw new Error(errorMessage);
    }

    return await response.json();
  } catch (error) {
    console.error('Errore nella modifica diploma:', error);
    throw error;
  }
};

// ===== GESTIONE LAUREE =====

// Aggiungi laurea
export const aggiungiLaurea = async (datiLaurea) => {
  try {
    const response = await fetch(`${API_BASE_URL}/gestione-laurea/aggiungi`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(datiLaurea),
    });

    if (!response.ok) {
      const contentType = response.headers.get('content-type');
      let errorMessage = `Errore HTTP: ${response.status} ${response.statusText}`;
      
      if (contentType && contentType.includes('application/json')) {
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (jsonError) {
          // Se il parsing JSON fallisce, usa il messaggio di default
        }
      }
      
      throw new Error(errorMessage);
    }

    return await response.json();
  } catch (error) {
    console.error('Errore nell\'aggiunta laurea:', error);
    throw error;
  }
};

// Modifica laurea
export const modificaLaurea = async (laureaId, datiLaurea) => {
  try {
    const response = await fetch(`${API_BASE_URL}/gestione-laurea/modifica/${laureaId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(datiLaurea),
    });

    if (!response.ok) {
      const contentType = response.headers.get('content-type');
      let errorMessage = `Errore HTTP: ${response.status} ${response.statusText}`;
      
      if (contentType && contentType.includes('application/json')) {
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (jsonError) {
          // Se il parsing JSON fallisce, usa il messaggio di default
        }
      }
      
      throw new Error(errorMessage);
    }

    return await response.json();
  } catch (error) {
    console.error('Errore nella modifica laurea:', error);
    throw error;
  }
};

// Rimuovi laurea
export const rimuoviLaurea = async (laureaId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/gestione-laurea/rimuovi/${laureaId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const contentType = response.headers.get('content-type');
      let errorMessage = `Errore HTTP: ${response.status} ${response.statusText}`;
      
      if (contentType && contentType.includes('application/json')) {
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (jsonError) {
          // Se il parsing JSON fallisce, usa il messaggio di default
        }
      }
      
      throw new Error(errorMessage);
    }

    return await response.json();
  } catch (error) {
    console.error('Errore nella rimozione laurea:', error);
    throw error;
  }
};

// ===== GESTIONE ATTESTATI =====

// Aggiungi attestato
export const aggiungiAttestato = async (datiAttestato) => {
  try {
    const response = await fetch(`${API_BASE_URL}/gestione-attestato/aggiungi`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(datiAttestato),
    });

    if (!response.ok) {
      const contentType = response.headers.get('content-type');
      let errorMessage = `Errore HTTP: ${response.status} ${response.statusText}`;
      
      if (contentType && contentType.includes('application/json')) {
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (jsonError) {
          // Se il parsing JSON fallisce, usa il messaggio di default
        }
      }
      
      throw new Error(errorMessage);
    }

    return await response.json();
  } catch (error) {
    console.error('Errore nell\'aggiunta attestato:', error);
    throw error;
  }
};

// Modifica attestato
export const modificaAttestato = async (attestatoId, datiAttestato) => {
  try {
    const response = await fetch(`${API_BASE_URL}/gestione-attestato/modifica/${attestatoId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(datiAttestato),
    });

    if (!response.ok) {
      const contentType = response.headers.get('content-type');
      let errorMessage = `Errore HTTP: ${response.status} ${response.statusText}`;
      
      if (contentType && contentType.includes('application/json')) {
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (jsonError) {
          // Se il parsing JSON fallisce, usa il messaggio di default
        }
      }
      
      throw new Error(errorMessage);
    }

    return await response.json();
  } catch (error) {
    console.error('Errore nella modifica attestato:', error);
    throw error;
  }
};

// Rimuovi attestato
export const rimuoviAttestato = async (attestatoId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/gestione-attestato/rimuovi/${attestatoId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const contentType = response.headers.get('content-type');
      let errorMessage = `Errore HTTP: ${response.status} ${response.statusText}`;
      
      if (contentType && contentType.includes('application/json')) {
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (jsonError) {
          // Se il parsing JSON fallisce, usa il messaggio di default
        }
      }
      
      throw new Error(errorMessage);
    }

    return await response.json();
  } catch (error) {
    console.error('Errore nella rimozione attestato:', error);
    throw error;
  }
};

// api.js - Aggiungi queste funzioni al tuo file api.js esistente


// Funzione per ottenere le candidature del candidato
export const getCandidature = async (candidatoId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/candidaturas?filters[utente_candidato][id][$eq]=${candidatoId}&populate=*`);
    if (!response.ok) {
      throw new Error('Errore nel recupero delle candidature');
    }
    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error('Errore getCandidature:', error);
    return []; // Ritorna array vuoto in caso di errore
  }
};

// Funzione per ottenere le offerte consigliate per un candidato
export const getOfferteConsigliate = async (candidatoId) => {
  try {
    // Questo endpoint dovrà essere implementato nel backend
    // Per ora ritorna un array vuoto
    const response = await fetch(`${API_BASE_URL}/offerte-consigliate/${candidatoId}`);
    if (!response.ok) {
      // Se l'endpoint non esiste ancora, ritorna array vuoto
      return [];
    }
    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error('Errore getOfferteConsigliate:', error);
    return []; // Ritorna array vuoto in caso di errore
  }
};

// Funzione per ottenere le notifiche del candidato
export const getNotificheCandidato = async (candidatoId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/notificas?filters[utente_candidato][id][$eq]=${candidatoId}&populate=*`);
    if (!response.ok) {
      throw new Error('Errore nel recupero delle notifiche');
    }
    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error('Errore getNotificheCandidato:', error);
    return [];
  }
};