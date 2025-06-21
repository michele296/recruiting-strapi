import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const GestioneFormazione = () => {
  const { candidatoId } = useParams();
  const navigate = useNavigate();

  // Aggiungi questo dopo const navigate = useNavigate();
useEffect(() => {
  // Verifica che l'utente sia loggato e che l'ID corrisponda
  const storedCandidatoId = localStorage.getItem('candidatoId');
  const isLoggedIn = localStorage.getItem('isLoggedIn');
  
  if (!isLoggedIn || !candidatoId || storedCandidatoId !== candidatoId) {
    navigate('/login-candidato');
    return;
  }
}, [candidatoId, navigate]);
  
  // Stati per i dati del candidato e formazione disponibile
  const [candidatoData, setCandidatoData] = useState(null);
  const [formazioneDisponibile, setFormazioneDisponibile] = useState({
    diplomi: [],
    lauree: [],
    attestati: [],
    scuole: [],
    universita: []
  });
  
  // Stati per i modali
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(''); // 'diploma', 'laurea', 'attestato'
  const [modalMode, setModalMode] = useState('add'); // 'add', 'edit'
  const [selectedItem, setSelectedItem] = useState(null);
  
  // Stati per i form
  const [formData, setFormData] = useState({
    diploma_id: '',
    scuola_id: '',
    voto_diploma: '',
    laurea_id: '',
    universita_id: '',
    voto: '',
    attestato_id: '',
    livello: ''
  });
  
  // Stati per loading e errori
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!candidatoId) {
      alert('ID candidato mancante');
      return;
    }
    fetchInitialData();
  }, [candidatoId]);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      
      // Fetch dati candidato e formazione disponibile in parallelo
      const [candidatoResponse, formazioneResponse] = await Promise.all([
        fetch(`http://localhost:1337/api/utente-candidato/${candidatoId}/info-completa`),
        fetch('http://localhost:1337/api/formazione')
      ]);

      if (!candidatoResponse.ok || !formazioneResponse.ok) {
        throw new Error('Errore nel recupero dei dati');
      }

      const candidatoData = await candidatoResponse.json();
      const formazioneData = await formazioneResponse.json();
      
      setCandidatoData(candidatoData);
      setFormazioneDisponibile(formazioneData);
      
    } catch (error) {
      console.error('Errore nel fetch dei dati:', error);
      alert('Errore nel caricamento dei dati');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      diploma_id: '',
      scuola_id: '',
      voto_diploma: '',
      laurea_id: '',
      universita_id: '',
      voto: '',
      attestato_id: '',
      livello: ''
    });
  };

  const openModal = (type, mode = 'add', item = null) => {
    console.log('openModal chiamata con:', { type, mode, item }); // Debug
    
    setModalType(type);
    setModalMode(mode);
    setSelectedItem(item);
    
    if (mode === 'edit' && item) {
      console.log('Modalità edit per:', type, 'con item:', item); // Debug
      
      if (type === 'diploma') {
        setFormData({
          diploma_id: item.diploma?.id || '',
          scuola_id: item.scuola?.id || '',
          voto_diploma: item.voto || '',
          laurea_id: '',
          universita_id: '',
          voto: '',
          attestato_id: '',
          livello: ''
        });
      } else if (type === 'laurea') {
        setFormData({
          diploma_id: '',
          scuola_id: '',
          voto_diploma: '',
          laurea_id: item.laurea?.id || '',
          universita_id: item.universita?.id || '',
          voto: item.voto || '',
          attestato_id: '',
          livello: ''
        });
      } else if (type === 'attestato') {
        setFormData({
          diploma_id: '',
          scuola_id: '',
          voto_diploma: '',
          laurea_id: '',
          universita_id: '',
          voto: '',
          attestato_id: item.attestato?.id || '',
          livello: item.livello || ''
        });
      }
    } else {
      resetForm();
    }
    
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedItem(null);
    resetForm();
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      let url = '';
      let method = '';
      let body = { idUtente: candidatoId };

      if (modalType === 'diploma') {
        if (modalMode === 'add') {
          url = 'http://localhost:1337/api/gestione-diploma/aggiungi';
          method = 'POST';
          body = {
            ...body,
            diploma_id: formData.diploma_id,
            scuola_id: formData.scuola_id,
            voto_diploma: formData.voto_diploma
          };
        } else {
          url = `http://localhost:1337/api/gestione-diploma/modifica/${selectedItem.id}`;
          method = 'PUT';
          body = {
            diploma_id: formData.diploma_id,
            scuola_id: formData.scuola_id,
            voto_diploma: formData.voto_diploma
          };
        }
      } else if (modalType === 'laurea') {
        if (modalMode === 'add') {
          url = 'http://localhost:1337/api/gestione-laurea/aggiungi';
          method = 'POST';
          body = {
            ...body,
            laurea_id: formData.laurea_id,
            universita_id: formData.universita_id,
            voto: formData.voto
          };
        } else {
          url = `http://localhost:1337/api/gestione-laurea/modifica/${selectedItem.id}`;
          method = 'PUT';
          body = {
            laurea_id: formData.laurea_id,
            universita_id: formData.universita_id,
            voto: formData.voto
          };
        }
      } else if (modalType === 'attestato') {
        if (modalMode === 'add') {
          url = 'http://localhost:1337/api/gestione-attestato/aggiungi';
          method = 'POST';
          body = {
            ...body,
            attestato_id: formData.attestato_id,
            livello: formData.livello
          };
        } else {
          url = `http://localhost:1337/api/gestione-attestato/modifica/${selectedItem.id}`;
          method = 'PUT';
          body = {
            attestato_id: formData.attestato_id,
            livello: formData.livello
          };
        }
      }

      console.log('Invio richiesta:', { url, method, body }); // Debug

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Errore server:', errorText);
        throw new Error(`Errore nel salvataggio: ${response.status}`);
      }

      alert(`${modalType.charAt(0).toUpperCase() + modalType.slice(1)} ${modalMode === 'add' ? 'aggiunto' : 'modificato'} con successo`);
      closeModal();
      await fetchInitialData();
      
    } catch (error) {
      console.error('Errore:', error);
      alert('Errore durante il salvataggio: ' + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (type, id) => {
    console.log(`Tentativo di eliminare ${type} con ID:`, id); // Debug
    
    if (!id) {
      console.error('ID mancante per la cancellazione');
      alert('Errore: ID mancante');
      return;
    }
    
    if (!window.confirm(`Sei sicuro di voler eliminare questo ${type}?`)) return;

    try {
      let url = '';
      if (type === 'laurea') {
        url = `http://localhost:1337/api/gestione-laurea/rimuovi/${id}`;
      } else if (type === 'attestato') {
        url = `http://localhost:1337/api/gestione-attestato/rimuovi/${id}`;
      } else if (type === 'diploma') {
        url = `http://localhost:1337/api/gestione-diploma/rimuovi/${id}`;
      }

      console.log('URL di cancellazione:', url); // Debug

      const response = await fetch(url, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('Errore server:', errorData);
        throw new Error(`Errore nella cancellazione: ${response.status}`);
      }

      alert(`${type.charAt(0).toUpperCase() + type.slice(1)} eliminato con successo`);
      await fetchInitialData();
      
    } catch (error) {
      console.error('Errore:', error);
      alert('Errore durante la cancellazione: ' + error.message);
    }
  };

  if (loading) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center" style={{background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'}}>
        <div className="text-center text-white">
          <div className="spinner-border mb-3" role="status">
            <span className="visually-hidden">Caricamento...</span>
          </div>
          <p>Caricamento dati formazione...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{minHeight: '100vh', background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', fontFamily: 'Poppins, sans-serif'}}>
      <div className="container py-5">
        {/* Header */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <div>
                <h1 className="text-white fw-bold mb-2">
                  <i className="bi bi-mortarboard me-2"></i>
                  Gestione Formazione
                </h1>
                <p className="text-white-50 mb-0">
                  Gestisci i tuoi diplomi, lauree e attestati
                </p>
              </div>
             <button 
  className="btn btn-light fw-semibold"
  onClick={() => navigate('/dashboard-candidato')}
  style={{borderRadius: '12px', padding: '0.75rem 1.5rem'}}
>
                <i className="bi bi-arrow-left me-2"></i>
                Torna alla Dashboard
              </button>
            </div>
          </div>
        </div>

        {/* Diplomi Section */}
        <div className="row mb-5">
          <div className="col-12">
            <div className="bg-white rounded-4 shadow p-4">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h3 className="fw-bold text-dark mb-0">
                  <i className="bi bi-award me-2" style={{color: '#f5576c'}}></i>
                  Diplomi
                </h3>
                <button 
                  className="btn fw-semibold"
                  style={{
                    background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    padding: '0.75rem 1.5rem'
                  }}
                  onClick={() => openModal('diploma', 'add')}
                >
                  <i className="bi bi-plus-circle me-2"></i>
                  Aggiungi Diploma
                </button>
              </div>
              
              {candidatoData?.diplomi && candidatoData.diplomi.length > 0 ? (
                <div className="row">
                  {candidatoData.diplomi.map((diploma, index) => (
                    <div key={`diploma-${diploma.id}-${index}`} className="col-md-6 col-lg-4 mb-3">
                      <div className="card h-100 shadow-sm">
                        <div className="card-body">
                          <h6 className="card-title fw-bold text-primary">
                            {diploma.diploma?.nome || 'Diploma'}
                          </h6>
                          <p className="card-text">
                            <strong>Voto:</strong> {diploma.voto}<br/>
                            <strong>Scuola:</strong> {diploma.scuola?.nome || 'N/A'}
                          </p>
                          <div className="d-flex gap-2">
                            <button 
                              className="btn btn-sm btn-outline-primary"
                              onClick={() => openModal('diploma', 'edit', diploma)}
                            >
                              <i className="bi bi-pencil"></i>
                            </button>
                            <button 
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => handleDelete('diploma', diploma.id)}
                            >
                              <i className="bi bi-trash"></i>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <i className="bi bi-award display-1 text-muted"></i>
                  <h5 className="text-muted mt-3">Nessun diploma inserito</h5>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Lauree Section */}
        <div className="row mb-5">
          <div className="col-12">
            <div className="bg-white rounded-4 shadow p-4">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h3 className="fw-bold text-dark mb-0">
                  <i className="bi bi-mortarboard me-2" style={{color: '#f5576c'}}></i>
                  Lauree
                </h3>
                <button 
                  className="btn fw-semibold"
                  style={{
                    background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    padding: '0.75rem 1.5rem'
                  }}
                  onClick={() => openModal('laurea', 'add')}
                >
                  <i className="bi bi-plus-circle me-2"></i>
                  Aggiungi Laurea
                </button>
              </div>
              
              {candidatoData?.lauree && candidatoData.lauree.length > 0 ? (
                <div className="row">
                  {candidatoData.lauree.map((laurea, index) => (
                    <div key={`laurea-card-${laurea.id}-${index}`} className="col-md-6 col-lg-4 mb-3">
                      <div className="card h-100 shadow-sm">
                        <div className="card-body">
                          <h6 className="card-title fw-bold text-success">
                            {laurea.laurea?.nome || 'Laurea'}
                          </h6>
                          <p className="card-text">
                            <strong>Voto:</strong> {laurea.voto}<br/>
                            <strong>Università:</strong> {laurea.universita?.nome || 'N/A'}
                          </p>
                          <div className="d-flex gap-2">
                            <button 
                              className="btn btn-sm btn-outline-success"
                              onClick={() => {
                                console.log('Click modifica laurea:', laurea); // Debug
                                openModal('laurea', 'edit', laurea);
                              }}
                            >
                              <i className="bi bi-pencil"></i>
                            </button>
                            <button 
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => {
                                console.log('Click elimina laurea ID:', laurea.id); // Debug
                                handleDelete('laurea', laurea.id);
                              }}
                            >
                              <i className="bi bi-trash"></i>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <i className="bi bi-mortarboard display-1 text-muted"></i>
                  <h5 className="text-muted mt-3">Nessuna laurea inserita</h5>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Attestati Section */}
        <div className="row mb-5">
          <div className="col-12">
            <div className="bg-white rounded-4 shadow p-4">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h3 className="fw-bold text-dark mb-0">
                  <i className="bi bi-patch-check me-2" style={{color: '#f5576c'}}></i>
                  Attestati
                </h3>
                <button 
                  className="btn fw-semibold"
                  style={{
                    background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    padding: '0.75rem 1.5rem'
                  }}
                  onClick={() => openModal('attestato', 'add')}
                >
                  <i className="bi bi-plus-circle me-2"></i>
                  Aggiungi Attestato
                </button>
              </div>
              
              {candidatoData?.attestati && candidatoData.attestati.length > 0 ? (
                <div className="row">
                  {candidatoData.attestati.map((attestato, index) => (
                    <div key={`attestato-card-${attestato.id}-${index}`} className="col-md-6 col-lg-4 mb-3">
                      <div className="card h-100 shadow-sm">
                        <div className="card-body">
                          <h6 className="card-title fw-bold text-info">
                            {attestato.attestato?.nome || 'Attestato'}
                          </h6>
                          <p className="card-text">
                            <strong>Livello:</strong> {attestato.livello || 'N/A'}
                          </p>
                          <div className="d-flex gap-2">
                            <button 
                              className="btn btn-sm btn-outline-info"
                              onClick={() => {
                                console.log('Click modifica attestato:', attestato); // Debug
                                openModal('attestato', 'edit', attestato);
                              }}
                            >
                              <i className="bi bi-pencil"></i>
                            </button>
                            <button 
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => {
                                console.log('Click elimina attestato ID:', attestato.id); // Debug
                                handleDelete('attestato', attestato.id);
                              }}
                            >
                              <i className="bi bi-trash"></i>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <i className="bi bi-patch-check display-1 text-muted"></i>
                  <h5 className="text-muted mt-3">Nessun attestato inserito</h5>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal show d-block" tabIndex="-1" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header" style={{background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'}}>
                <h5 className="modal-title text-white fw-bold">
                  {modalMode === 'add' ? 'Aggiungi' : 'Modifica'} {modalType.charAt(0).toUpperCase() + modalType.slice(1)}
                </h5>
                <button type="button" className="btn-close btn-close-white" onClick={closeModal}></button>
              </div>
              <div className="modal-body">
                <form onSubmit={handleSubmit}>
                  {modalType === 'diploma' && (
                    <>
                      <div className="mb-3">
                        <label className="form-label fw-semibold">Diploma</label>
                        <select 
                          className="form-select" 
                          name="diploma_id"
                          value={formData.diploma_id}
                          onChange={handleInputChange}
                          required
                        >
                          <option value="">Seleziona un diploma</option>
                          {formazioneDisponibile.diplomi.map(diploma => (
                            <option key={`diploma-option-${diploma.id}`} value={diploma.id}>
                              {diploma.nome}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="mb-3">
                        <label className="form-label fw-semibold">Scuola</label>
                        <select 
                          className="form-select" 
                          name="scuola_id"
                          value={formData.scuola_id}
                          onChange={handleInputChange}
                          required
                        >
                          <option value="">Seleziona una scuola</option>
                          {formazioneDisponibile.scuole.map(scuola => (
                            <option key={`scuola-option-${scuola.id}`} value={scuola.id}>
                              {scuola.nome}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="mb-3">
                        <label className="form-label fw-semibold">Voto</label>
                        <input 
                          type="text" 
                          className="form-control" 
                          name="voto_diploma"
                          value={formData.voto_diploma}
                          onChange={handleInputChange}
                          placeholder="Es. 100/100"
                          required
                        />
                      </div>
                    </>
                  )}

                  {modalType === 'laurea' && (
                    <>
                      <div className="mb-3">
                        <label className="form-label fw-semibold">Laurea</label>
                        <select 
                          className="form-select" 
                          name="laurea_id"
                          value={formData.laurea_id}
                          onChange={handleInputChange}
                          required
                        >
                          <option value="">Seleziona una laurea</option>
                          {formazioneDisponibile.lauree.map(laurea => (
                            <option key={`laurea-sel-${laurea.id}`} value={laurea.id}>
                              {laurea.nome}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="mb-3">
                        <label className="form-label fw-semibold">Università</label>
                        <select 
                          className="form-select" 
                          name="universita_id"
                          value={formData.universita_id}
                          onChange={handleInputChange}
                          required
                        >
                          <option value="">Seleziona un'università</option>
                          {formazioneDisponibile.universita.map(universita => (
                            <option key={`uni-sel-${universita.id}`} value={universita.id}>
                              {universita.nome}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="mb-3">
                        <label className="form-label fw-semibold">Voto</label>
                        <input 
                          type="text" 
                          className="form-control" 
                          name="voto"
                          value={formData.voto}
                          onChange={handleInputChange}
                          placeholder="Es. 110/110"
                          required
                        />
                      </div>
                    </>
                  )}

                  {modalType === 'attestato' && (
                    <>
                      <div className="mb-3">
                        <label className="form-label fw-semibold">Attestato</label>
                        <select 
                          className="form-select" 
                          name="attestato_id"
                          value={formData.attestato_id}
                          onChange={handleInputChange}
                          required
                        >
                          <option value="">Seleziona un attestato</option>
                          {formazioneDisponibile.attestati.map(attestato => (
                            <option key={`att-sel-${attestato.id}`} value={attestato.id}>
                              {attestato.nome}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="mb-3">
                        <label className="form-label fw-semibold">Livello</label>
                        <input 
                          type="text" 
                          className="form-control" 
                          name="livello"
                          value={formData.livello}
                          onChange={handleInputChange}
                          placeholder="Es. Base, Intermedio, Avanzato"
                          required
                        />
                      </div>
                    </>
                  )}

                  <div className="d-flex justify-content-end gap-2">
                    <button type="button" className="btn btn-secondary" onClick={closeModal}>
                      Annulla
                    </button>
                    <button 
                      type="submit" 
                      className="btn text-white fw-semibold"
                      style={{background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'}}
                      disabled={submitting}
                    >
                      {submitting ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                          Salvando...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-check-circle me-2"></i>
                          {modalMode === 'add' ? 'Aggiungi' : 'Modifica'}
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GestioneFormazione;