// services/api.js
const API_BASE_URL = 'http://localhost:1337/api';

// Funzione helper per le chiamate API
const apiCall = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const contentType = response.headers.get('content-type');
      let errorMessage = `Errore HTTP: ${response.status} ${response.statusText}`;
      
      if (contentType && contentType.includes('application/json')) {
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error?.message || errorMessage;
        } catch (jsonError) {
          // Se il parsing JSON fallisce, usa il messaggio di default
        }
      }
      
      throw new Error(errorMessage);
    }

    return await response.json();
  } catch (error) {
    console.error(`API Error for ${endpoint}:`, error);
    throw error;
  }
};

// ===== AUTENTICAZIONE =====

// Registrazione Azienda
export const registraAzienda = async (datiAzienda) => {
  return await apiCall('/registra-azienda/registra', {
    method: 'POST',
    body: JSON.stringify(datiAzienda),
  });
};

// Login Utente Aziendale
export const loginUtenteAziendale = async (credenziali) => {
  return await apiCall('/login-utente-aziendale/login', {
    method: 'POST',
    body: JSON.stringify(credenziali),
  });
};

// Registrazione Candidato
export const registraCandidato = async (datiCandidato) => {
  return await apiCall('/registrazione-utente-candidato/registra', {
    method: 'POST',
    body: JSON.stringify(datiCandidato),
  });
};

// Login Utente Candidato
export const loginUtenteCandidato = async (credenziali) => {
  const data = await apiCall('/login-utente-candidato/login', {
    method: 'POST',
    body: JSON.stringify(credenziali),
  });

  console.log('Login API response:', data);
  return data;
};