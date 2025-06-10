import React, { useState, useEffect } from 'react';
import {
  getIndirizziScolastici,
  getScuoleByIndirizzo,
  getLauree,
  getUniversitaByLaurea,
  getAttestati,
  aggiungiDiploma,
  modificaDiploma,
  aggiungiLaurea,
  modificaLaurea,
  rimuoviLaurea,
  aggiungiAttestato,
  modificaAttestato,
  rimuoviAttestato,
  getCandidatoProfile
} from '../services/api';

import '../styles/GestioneCompetenze.css';

const GestioneCompetenze = ({ candidatoId }) => {
  // Stati principali
  const [loading, setLoading] = useState(true);
  const [candidato, setCandidato] = useState(null);
  const [activeTab, setActiveTab] = useState('diploma');

  // Stati per dati del backend
  const [indirizziScolastici, setIndirizziScolastici] = useState([]);
  const [scuoleFiltrate, setScuoleFiltrate] = useState([]);
  const [lauree, setLauree] = useState([]);
  const [universitaFiltrate, setUniversitaFiltrate] = useState([]);
  const [attestati, setAttestati] = useState([]);

  // Stati per form diploma
  const [diplomaForm, setDiplomaForm] = useState({
    voto_diploma: '',
    indirizzo_id: '',
    scuola_id: '',
    searchScuola: ''
  });

  // Stati per form laurea
  const [laureeUtente, setLaureeUtente] = useState([]);
  const [nuovaLaurea, setNuovaLaurea] = useState({
    voto: '',
    laurea_id: '',
    universita_id: '',
    searchLaurea: '',
    searchUniversita: ''
  });
  const [editingLaurea, setEditingLaurea] = useState(null);

  // Stati per form attestato
  const [attestatiUtente, setAttestatiUtente] = useState([]);
  const [nuovoAttestato, setNuovoAttestato] = useState({
    livello: '',
    attestato_id: '',
    searchAttestato: ''
  });
  const [editingAttestato, setEditingAttestato] = useState(null);

  
  // Caricamento iniziale
  useEffect(() => {
    if (candidatoId) {
      loadInitialData();
    }
  }, [candidatoId]);

  const loadInitialData = async () => {
    try {
      setLoading(true);

      // Carica profilo candidato
      const profiloCandidato = await getCandidatoProfile(candidatoId);
      setCandidato(profiloCandidato.data);

      // Carica dati per dropdown
      const [indirizzi, laureeList, attestatiList] = await Promise.all([
        getIndirizziScolastici(),
        getLauree(),
        getAttestati()
      ]);

      setIndirizziScolastici(indirizzi.data || []);
      setLauree(laureeList.data || []);
      setAttestati(attestatiList.data || []);

      // Imposta form diploma se già presente
      if (profiloCandidato.data.voto_diploma) {
        setDiplomaForm({
          voto_diploma: profiloCandidato.data.voto_diploma,
          indirizzo_id: profiloCandidato.data.Indirizzo_scolastico?.id || '',
          scuola_id: profiloCandidato.data.scuola_frequentata?.id || '',
          searchScuola: profiloCandidato.data.scuola_frequentata?.nome || ''
        });

        if (profiloCandidato.data.Indirizzo_scolastico?.id) {
          const scuole = await getScuoleByIndirizzo(profiloCandidato.data.Indirizzo_scolastico.id);
          setScuoleFiltrate(scuole.data || []);
        }
      }

      // Carica lauree e attestati dell'utente
      setLaureeUtente(profiloCandidato.data.ha_titolo_laureas || []);
      setAttestatiUtente(profiloCandidato.data.possiedees || []);

    } catch (error) {
      console.error('Errore caricamento dati:', error);
      alert('Errore nel caricamento dei dati');
    } finally {
      setLoading(false);
    }
  };

  // Gestione diploma
  const handleIndirizzoChange = async (indirizzoId) => {
    setDiplomaForm(prev => ({
      ...prev,
      indirizzo_id: indirizzoId,
      scuola_id: '',
      searchScuola: ''
    }));

    if (indirizzoId) {
      try {
        const scuole = await getScuoleByIndirizzo(indirizzoId);
        setScuoleFiltrate(scuole.data || []);
      } catch (error) {
        console.error('Errore caricamento scuole:', error);
        setScuoleFiltrate([]);
      }
    } else {
      setScuoleFiltrate([]);
    }
  };

  const handleSearchScuola = (searchTerm) => {
    setDiplomaForm(prev => ({ ...prev, searchScuola: searchTerm }));
  };

  const getScuoleFiltrate = () => {
    if (!diplomaForm.searchScuola) return scuoleFiltrate;
    return scuoleFiltrate.filter(scuola =>
      scuola.attributes.nome.toLowerCase().includes(diplomaForm.searchScuola.toLowerCase())
    );
  };

  const handleSaveDiploma = async () => {
    if (!diplomaForm.voto_diploma || !diplomaForm.indirizzo_id || !diplomaForm.scuola_id) {
      alert('Compila tutti i campi richiesti');
      return;
    }

    try {
      if (candidato.voto_diploma) {
        await modificaDiploma(candidatoId, {
          voto_diploma: diplomaForm.voto_diploma,
          indirizzo_id: diplomaForm.indirizzo_id,
          scuola_ids: [diplomaForm.scuola_id]
        });
      } else {
        await aggiungiDiploma({
          idUtente: candidatoId,
          voto_diploma: diplomaForm.voto_diploma,
          indirizzo_id: diplomaForm.indirizzo_id,
          scuola_id: diplomaForm.scuola_id
        });
      }

      alert('Diploma salvato con successo');
      loadInitialData();
    } catch (error) {
      console.error('Errore salvataggio diploma:', error);
      alert('Errore nel salvataggio del diploma');
    }
  };

  // Gestione lauree
  const handleLaureaChange = async (laurea_id) => {
    setNuovaLaurea(prev => ({
      ...prev,
      laurea_id,
      universita_id: '',
      searchUniversita: ''
    }));

    if (laurea_id) {
      try {
        const universita = await getUniversitaByLaurea(laurea_id);
        setUniversitaFiltrate(universita.data || []);
      } catch (error) {
        console.error('Errore caricamento università:', error);
        setUniversitaFiltrate([]);
      }
    } else {
      setUniversitaFiltrate([]);
    }
  };

  const handleSearchLaurea = (searchTerm) => {
    setNuovaLaurea(prev => ({ ...prev, searchLaurea: searchTerm }));
  };

  const handleSearchUniversita = (searchTerm) => {
    setNuovaLaurea(prev => ({ ...prev, searchUniversita: searchTerm }));
  };

  const getLaureeFiltrate = () => {
    if (!nuovaLaurea.searchLaurea) return lauree;
    return lauree.filter(laurea =>
      laurea.attributes.nome.toLowerCase().includes(nuovaLaurea.searchLaurea.toLowerCase())
    );
  };

  const getUniversitaFiltrate = () => {
    if (!nuovaLaurea.searchUniversita) return universitaFiltrate;
    return universitaFiltrate.filter(uni =>
      uni.attributes.nome.toLowerCase().includes(nuovaLaurea.searchUniversita.toLowerCase())
    );
  };

  const handleSaveLaurea = async () => {
    if (!nuovaLaurea.voto || !nuovaLaurea.laurea_id || !nuovaLaurea.universita_id) {
      alert('Compila tutti i campi richiesti');
      return;
    }

    try {
      if (editingLaurea) {
        await modificaLaurea(editingLaurea.id, {
          voto: nuovaLaurea.voto,
          laurea_id: nuovaLaurea.laurea_id,
          universita_id: nuovaLaurea.universita_id
        });
        setEditingLaurea(null);
      } else {
        await aggiungiLaurea({
          idUtente: candidatoId,
          voto: nuovaLaurea.voto,
          laurea_id: nuovaLaurea.laurea_id,
          universita_id: nuovaLaurea.universita_id
        });
      }

      setNuovaLaurea({
        voto: '',
        laurea_id: '',
        universita_id: '',
        searchLaurea: '',
        searchUniversita: ''
      });

      alert('Laurea salvata con successo');
      loadInitialData();
    } catch (error) {
      console.error('Errore salvataggio laurea:', error);
      alert('Errore nel salvataggio della laurea');
    }
  };

  const handleEditLaurea = (laurea) => {
    setEditingLaurea(laurea);
    setNuovaLaurea({
      voto: laurea.attributes.voto,
      laurea_id: laurea.attributes.laurea?.data?.id || '',
      universita_id: laurea.attributes.universita_frequentata?.data?.id || '',
      searchLaurea: laurea.attributes.laurea?.data?.attributes?.nome || '',
      searchUniversita: laurea.attributes.universita_frequentata?.data?.attributes?.nome || ''
    });

    // Carica università per la laurea selezionata
    if (laurea.attributes.laurea?.data?.id) {
      handleLaureaChange(laurea.attributes.laurea.data.id);
    }
  };

  const handleDeleteLaurea = async (laureaId) => {
    if (window.confirm('Sei sicuro di voler eliminare questa laurea?')) {
      try {
        await rimuoviLaurea(laureaId);
        alert('Laurea eliminata con successo');
        loadInitialData();
      } catch (error) {
        console.error('Errore eliminazione laurea:', error);
        alert('Errore nell\'eliminazione della laurea');
      }
    }
  };

  // Gestione attestati
  const handleSearchAttestato = (searchTerm) => {
    setNuovoAttestato(prev => ({ ...prev, searchAttestato: searchTerm }));
  };

  const getAttestatiFiltrati = () => {
    if (!nuovoAttestato.searchAttestato) return attestati;
    return attestati.filter(attestato =>
      attestato.attributes.nome.toLowerCase().includes(nuovoAttestato.searchAttestato.toLowerCase())
    );
  };

  const handleSaveAttestato = async () => {
    if (!nuovoAttestato.livello || !nuovoAttestato.attestato_id) {
      alert('Compila tutti i campi richiesti');
      return;
    }

    try {
      if (editingAttestato) {
        await modificaAttestato(editingAttestato.id, {
          livello: nuovoAttestato.livello,
          attestato_id: nuovoAttestato.attestato_id
        });
        setEditingAttestato(null);
      } else {
        await aggiungiAttestato({
          idUtente: candidatoId,
          livello: nuovoAttestato.livello,
          attestato_id: nuovoAttestato.attestato_id
        });
      }

      setNuovoAttestato({
        livello: '',
        attestato_id: '',
        searchAttestato: ''
      });

      alert('Attestato salvato con successo');
      loadInitialData();
    } catch (error) {
      console.error('Errore salvataggio attestato:', error);
      alert('Errore nel salvataggio dell\'attestato');
    }
  };

  const handleEditAttestato = (attestato) => {
    setEditingAttestato(attestato);
    setNuovoAttestato({
      livello: attestato.attributes.livello,
      attestato_id: attestato.attributes.attestato?.data?.id || '',
      searchAttestato: attestato.attributes.attestato?.data?.attributes?.nome || ''
    });
  };

  const handleDeleteAttestato = async (attestatoId) => {
    if (window.confirm('Sei sicuro di voler eliminare questo attestato?')) {
      try {
        await rimuoviAttestato(attestatoId);
        alert('Attestato eliminato con successo');
        loadInitialData();
      } catch (error) {
        console.error('Errore eliminazione attestato:', error);
        alert('Errore nell\'eliminazione dell\'attestato');
      }
    }
  };

  if (loading) {
    return (
      <div className="competenze-loading">
        <div className="loading-spinner"></div>
        <p>Caricamento competenze...</p>
      </div>
    );
  }

  return (
    <div className="gestione-competenze-container">
      <div className="competenze-header">
        <h1>Gestione Competenze</h1>
        <p>Gestisci le tue competenze formative</p>
      </div>

      <div className="competenze-tabs">
        <button
          className={`tab-btn ${activeTab === 'diploma' ? 'active' : ''}`}
          onClick={() => setActiveTab('diploma')}
        >
          <i className="fas fa-graduation-cap"></i>
          Diploma
        </button>
        <button
          className={`tab-btn ${activeTab === 'laurea' ? 'active' : ''}`}
          onClick={() => setActiveTab('laurea')}
        >
          <i className="fas fa-user-graduate"></i>
          Lauree
        </button>
        <button
          className={`tab-btn ${activeTab === 'attestato' ? 'active' : ''}`}
          onClick={() => setActiveTab('attestato')}
        >
          <i className="fas fa-certificate"></i>
          Attestati
        </button>
      </div>

      <div className="competenze-content">
        {/* TAB DIPLOMA */}
        {activeTab === 'diploma' && (
          <div className="diploma-section">
            <h3>Diploma di Scuola Superiore</h3>
            <div className="form-grid">
              <div className="form-group">
                <label>Voto Diploma *</label>
                <input
                  type="text"
                  value={diplomaForm.voto_diploma}
                  onChange={(e) => setDiplomaForm(prev => ({...prev, voto_diploma: e.target.value}))}
                  placeholder="es. 95/100, 110/110"
                />
              </div>

              <div className="form-group">
                <label>Indirizzo Scolastico *</label>
                <select
                  value={diplomaForm.indirizzo_id}
                  onChange={(e) => handleIndirizzoChange(e.target.value)}
                >
                  <option value="">Seleziona indirizzo</option>
                  {indirizziScolastici.map(indirizzo => (
                    <option key={indirizzo.id} value={indirizzo.id}>
                      {indirizzo.attributes.nome}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Scuola Frequentata *</label>
                <input
                  type="text"
                  value={diplomaForm.searchScuola}
                  onChange={(e) => handleSearchScuola(e.target.value)}
                  placeholder="Cerca la tua scuola..."
                  disabled={!diplomaForm.indirizzo_id}
                />
                {diplomaForm.searchScuola && getScuoleFiltrate().length > 0 && (
                  <div className="dropdown-results">
                    {getScuoleFiltrate().slice(0, 10).map(scuola => (
                      <div
                        key={scuola.id}
                        className="dropdown-item"
                        onClick={() => {
                          setDiplomaForm(prev => ({
                            ...prev,
                            scuola_id: scuola.id,
                            searchScuola: scuola.attributes.nome
                          }));
                        }}
                      >
                        {scuola.attributes.nome}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <button className="save-btn" onClick={handleSaveDiploma}>
              <i className="fas fa-save"></i>
              {candidato?.voto_diploma ? 'Modifica Diploma' : 'Salva Diploma'}
            </button>
          </div>
        )}

        {/* TAB LAUREE */}
        {activeTab === 'laurea' && (
          <div className="lauree-section">
            <h3>Lauree</h3>

            {/* Lista lauree esistenti */}
            {laureeUtente.length > 0 && (
              <div className="existing-items">
                <h4>Le tue lauree:</h4>
                {laureeUtente.map(laurea => (
                  <div key={laurea.id} className="item-card">
                    <div className="item-info">
                      <h5>{laurea.attributes.laurea?.data?.attributes?.nome}</h5>
                      <p>Voto: {laurea.attributes.voto}</p>
                      <p>Università: {laurea.attributes.universita_frequentata?.data?.attributes?.nome}</p>
                    </div>
                    <div className="item-actions">
                      <button onClick={() => handleEditLaurea(laurea)} className="edit-btn">
                        <i className="fas fa-edit"></i>
                      </button>
                      <button onClick={() => handleDeleteLaurea(laurea.id)} className="delete-btn">
                        <i className="fas fa-trash"></i>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Form nuova laurea */}
            <div className="new-item-form">
              <h4>{editingLaurea ? 'Modifica Laurea' : 'Aggiungi Nuova Laurea'}</h4>
              <div className="form-grid">
                <div className="form-group">
                  <label>Voto *</label>
                  <input
                    type="text"
                    value={nuovaLaurea.voto}
                    onChange={(e) => setNuovaLaurea(prev => ({...prev, voto: e.target.value}))}
                    placeholder="es. 110/110, 105/110"
                  />
                </div>

                <div className="form-group">
                  <label>Cerca Laurea *</label>
                  <input
                    type="text"
                    value={nuovaLaurea.searchLaurea}
                    onChange={(e) => handleSearchLaurea(e.target.value)}
                    placeholder="Cerca il corso di laurea..."
                  />
                  {nuovaLaurea.searchLaurea && getLaureeFiltrate().length > 0 && (
                    <div className="dropdown-results">
                      {getLaureeFiltrate().slice(0, 10).map(laurea => (
                        <div
                          key={laurea.id}
                          className="dropdown-item"
                          onClick={() => {
                            setNuovaLaurea(prev => ({
                              ...prev,
                              laurea_id: laurea.id,
                              searchLaurea: laurea.attributes.nome
                            }));
                            handleLaureaChange(laurea.id);
                          }}
                        >
                          {laurea.attributes.nome}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label>Cerca Università *</label>
                  <input
                    type="text"
                    value={nuovaLaurea.searchUniversita}
                    onChange={(e) => handleSearchUniversita(e.target.value)}
                    placeholder="Cerca l'università..."
                    disabled={!nuovaLaurea.laurea_id}
                  />
                  {nuovaLaurea.searchUniversita && getUniversitaFiltrate().length > 0 && (
                    <div className="dropdown-results">
                      {getUniversitaFiltrate().slice(0, 10).map(uni => (
                        <div
                          key={uni.id}
                          className="dropdown-item"
                          onClick={() => {
                            setNuovaLaurea(prev => ({
                              ...prev,
                              universita_id: uni.id,
                              searchUniversita: uni.attributes.nome
                            }));
                          }}
                        >
                          {uni.attributes.nome}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="form-actions">
                <button className="save-btn" onClick={handleSaveLaurea}>
                  <i className="fas fa-save"></i>
                  {editingLaurea ? 'Modifica Laurea' : 'Aggiungi Laurea'}
                </button>
                {editingLaurea && (
                  <button
                    className="cancel-btn"
                    onClick={() => {
                      setEditingLaurea(null);
                      setNuovaLaurea({
                        voto: '',
                        laurea_id: '',
                        universita_id: '',
                        searchLaurea: '',
                        searchUniversita: ''
                      });
                    }}
                  >
                    <i className="fas fa-times"></i>
                    Annulla
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB ATTESTATI */}
        {activeTab === 'attestato' && (
          <div className="attestati-section">
            <h3>Attestati e Certificazioni</h3>

            {/* Lista attestati esistenti */}
            {attestatiUtente.length > 0 && (
              <div className="existing-items">
                <h4>I tuoi attestati:</h4>
                {attestatiUtente.map(attestato => (
                  <div key={attestato.id} className="item-card">
                    <div className="item-info">
                      <h5>{attestato.attributes.attestato?.data?.attributes?.nome}</h5>
                      <p>Livello: {attestato.attributes.livello}</p>
                    </div>
                    <div className="item-actions">
                      <button onClick={() => handleEditAttestato(attestato)} className="edit-btn">
                        <i className="fas fa-edit"></i>
                      </button>
                      <button onClick={() => handleDeleteAttestato(attestato.id)} className="delete-btn">
                        <i className="fas fa-trash"></i>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Form nuovo attestato */}
            <div className="new-item-form">
              <h4>{editingAttestato ? 'Modifica Attestato' : 'Aggiungi Nuovo Attestato'}</h4>
              <div className="form-grid">
                <div className="form-group">
                  <label>Livello *</label>
                  <input
                    type="text"
                    value={nuovoAttestato.livello}
                    onChange={(e) => setNuovoAttestato(prev => ({...prev, livello: e.target.value}))}
                    placeholder="es. Base, Intermedio, Avanzato, B2, C1..."
                  />
                </div>

                <div className="form-group">
                  <label>Cerca Attestato *</label>
                  <input
                    type="text"
                    value={nuovoAttestato.searchAttestato}
                    onChange={(e) => handleSearchAttestato(e.target.value)}
                    placeholder="Cerca l'attestato o certificazione..."
                  />
                  {nuovoAttestato.searchAttestato && getAttestatiFiltrati().length > 0 && (
                    <div className="dropdown-results">
                      {getAttestatiFiltrati().slice(0, 10).map(attestato => (
                        <div
                          key={attestato.id}
                          className="dropdown-item"
                          onClick={() => {
                            setNuovoAttestato(prev => ({
                              ...prev,
                              attestato_id: attestato.id,
                              searchAttestato: attestato.attributes.nome
                            }));
                          }}
                        >
                          {attestato.attributes.nome}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="form-actions">
                <button className="save-btn" onClick={handleSaveAttestato}>
                  <i className="fas fa-save"></i>
                  {editingAttestato ? 'Modifica Attestato' : 'Aggiungi Attestato'}
                </button>
                {editingAttestato && (
                  <button
                    className="cancel-btn"
                    onClick={() => {
                      setEditingAttestato(null);
                      setNuovoAttestato({
                        livello: '',
                        attestato_id: '',
                        searchAttestato: ''
                      });
                    }}
                  >
                    <i className="fas fa-times"></i>
                    Annulla
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GestioneCompetenze;