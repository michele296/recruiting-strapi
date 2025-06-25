import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import '../styles/DashboardCandidato.css';

const DettagliOfferta = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [offerta, setOfferta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [inviaLoading, setInviaLoading] = useState(false);
  const [candidaturaInviata, setCandidaturaInviata] = useState(false);
  const [compatibilita, setCompatibilita] = useState(null);
  const [aziendaInfo, setAziendaInfo] = useState(null);
  const [showAziendaInfo, setShowAziendaInfo] = useState(false);
  
  // Estrai candidatoId dalla query string
  const searchParams = new URLSearchParams(location.search);
  const candidatoId = searchParams.get('candidatoId');

  useEffect(() => {
    if (!candidatoId) {
      alert('ID candidato mancante');
      navigate('/login-candidato');
      return;
    }
    
    fetchDettagliOfferta();
  }, [id, candidatoId, navigate]);

  const fetchDettagliOfferta = async () => {
    try {
      const response = await fetch(`http://localhost:1337/api/offerta/${id}/dettagli`);
      
      if (!response.ok) {
        throw new Error('Errore nel recupero dei dettagli dell\'offerta');
      }

      const data = await response.json();
      setOfferta(data);
      
      // Se c'è un candidato, carica anche la compatibilità
      if (candidatoId) {
        await fetchCompatibilita();
      }
    } catch (error) {
      console.error('Errore nel fetch dei dettagli offerta:', error);
      alert('Errore nel caricamento dei dettagli dell\'offerta');
    } finally {
      setLoading(false);
    }
  };

  const fetchCompatibilita = async () => {
    try {
      const response = await fetch(`http://localhost:1337/api/compatibilita-offerta/${id}/${candidatoId}`);
      
      if (!response.ok) {
        throw new Error('Errore nel calcolo della compatibilità');
      }

      const data = await response.json();
      setCompatibilita(data);
    } catch (error) {
      console.error('Errore nel fetch della compatibilità:', error);
    }
  };

  const fetchAziendaInfo = async (aziendaId) => {
    try {
      const response = await fetch(`http://localhost:1337/api/ottieni-azienda/${aziendaId}`);
      
      if (!response.ok) {
        throw new Error('Errore nel recupero informazioni azienda');
      }

      const data = await response.json();
      setAziendaInfo(data.azienda);
    } catch (error) {
      console.error('Errore nel fetch azienda:', error);
    }
  };

  const handleInviaCandidatura = async () => {
    if (!candidatoId || !id) {
      alert('Dati mancanti per l\'invio della candidatura');
      return;
    }

    setInviaLoading(true);
    
    try {
      const response = await fetch('http://localhost:1337/api/invia-candidatura/invia', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          offertaId: parseInt(id),
          utenteCandidatoId: parseInt(candidatoId)
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || data.message || 'Errore nell\'invio della candidatura');
      }

      setCandidaturaInviata(true);
      alert('Candidatura inviata con successo!');
      
    } catch (error) {
      console.error('Errore nell\'invio della candidatura:', error);
      alert(error.message);
    } finally {
      setInviaLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('it-IT');
  };

  if (loading) {
    return (
      <div className="container-fluid min-vh-100 d-flex justify-content-center align-items-center" style={{background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'}}>
        <div className="text-center text-white">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Caricamento...</span>
          </div>
          <p className="mt-3">Caricamento dettagli offerta...</p>
        </div>
      </div>
    );
  }

  if (!offerta) {
    return (
      <div className="container-fluid min-vh-100 d-flex justify-content-center align-items-center" style={{background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'}}>
        <div className="text-center text-white">
          <h3>Errore nel caricamento dell'offerta</h3>
          <button className="btn btn-light mt-3" onClick={() => navigate(-1)}>
            Torna Indietro
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid bg-light min-vh-100 py-4">
      <div className="container">
        {/* Header con breadcrumb */}
        <div className="row mb-4">
          <div className="col-12">
            <nav aria-label="breadcrumb">
              <ol className="breadcrumb">
                <li className="breadcrumb-item">
                  <button 
                    className="btn btn-link p-0 text-decoration-none"
                    onClick={() => navigate(-1)}
                  >
                    <i className="bi bi-arrow-left me-2"></i>Dashboard
                  </button>
                </li>
                <li className="breadcrumb-item active" aria-current="page">
                  Dettagli Offerta
                </li>
              </ol>
            </nav>
          </div>
        </div>

        {/* Modal Informazioni Azienda */}
        {showAziendaInfo && aziendaInfo && (
          <div className="modal show d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
            <div className="modal-dialog modal-lg">
              <div className="modal-content">
                <div className="modal-header" style={{background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white'}}>
                  <h5 className="modal-title">
                    <i className="bi bi-building me-2"></i>
                    {aziendaInfo.Nome}
                  </h5>
                  <button 
                    type="button" 
                    className="btn-close btn-close-white" 
                    onClick={() => setShowAziendaInfo(false)}
                  ></button>
                </div>
                <div className="modal-body">
                  <div className="row">
                    <div className="col-md-6">
                      <h6 className="text-muted">INFORMAZIONI GENERALI</h6>
                      <p><strong>Nome:</strong> {aziendaInfo.Nome || 'N/A'}</p>
                      <p><strong>Provincia:</strong> {aziendaInfo.Provincia || 'N/A'}</p>
                      <p><strong>Email:</strong> {aziendaInfo.email_contatto || 'N/A'}</p>
                    </div>
                    <div className="col-md-6">
                      <h6 className="text-muted">DETTAGLI AZIENDA</h6>
                      <p><strong>Dipendenti:</strong> {aziendaInfo.numero_dipendenti || 'N/A'}</p>
                      <p><strong>Offerte Attive:</strong> {aziendaInfo.offertas?.length || 0}</p>
                      <p><strong>Utenti Aziendali:</strong> {aziendaInfo.utenti_aziendali?.length || 0}</p>
                    </div>
                  </div>
                  {aziendaInfo.Descrizione && (
                    <div className="mt-3">
                      <h6 className="text-muted">DESCRIZIONE</h6>
                      <p>{aziendaInfo.Descrizione}</p>
                    </div>
                  )}
                  {aziendaInfo.valori_aziendali && (
                    <div className="mt-3">
                      <h6 className="text-muted">VALORI AZIENDALI</h6>
                      <p>{aziendaInfo.valori_aziendali}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Dettagli Offerta */}
        <div className="row">
          <div className="col-lg-8">
            <div className="card shadow-sm mb-4">
              <div className="card-header text-white" style={{background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'}}>
                <h2 className="card-title mb-0">
                  <i className="bi bi-briefcase me-2"></i>
                  {offerta.info || 'Offerta di lavoro'}
                </h2>
              </div>
              <div className="card-body">
                <div className="row">
                  <div className="col-md-6">
                    <h6 className="text-muted">INFORMAZIONI GENERALI</h6>
                    <div className="mb-3">
                      <p className="mb-1"><strong>Azienda:</strong></p>
                      <button 
                        className="btn btn-link p-0 text-decoration-none d-flex align-items-center"
                        style={{color: '#f093fb', fontWeight: 'bold', fontSize: '1.25rem'}}
                        onClick={() => {
                          const aziendaId = offerta.azienda?.id || offerta.utente_aziendale?.azienda?.id;
                          if (aziendaId) {
                            fetchAziendaInfo(aziendaId);
                            setShowAziendaInfo(true);
                          }
                        }}
                      >
                        <i className="bi bi-building me-2" style={{fontSize: '1.1rem'}}></i>
                        {offerta.azienda?.Nome || offerta.utente_aziendale?.azienda?.Nome || 'N/A'}
                        <i className="bi bi-box-arrow-up-right ms-2" style={{fontSize: '0.9rem'}}></i>
                      </button>
                    </div>
                    <p><strong>Provincia:</strong> {offerta.Provincia}</p>
                    <p><strong>Stipendio:</strong> €{offerta.stipendio || 'N/A'}</p>
                    <p><strong>Benefit:</strong> {offerta.benefit || 'N/A'}</p>
                    <p><strong>Data pubblicazione:</strong> {formatDate(offerta.createdAt)}</p>
                  </div>
                  <div className="col-md-6">
                    <h6 className="text-muted">DETTAGLI AGGIUNTIVI</h6>
                    <p><strong>Tipo contratto:</strong> {offerta.tipo_contratto}</p>
                    {offerta.descrizione && (
                      <p><strong>Descrizione:</strong> {offerta.descrizione}</p>
                    )}
                    {offerta.requisiti && (
                      <p><strong>Requisiti:</strong> {offerta.requisiti}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Requisiti Formativi */}
            {(offerta.diplomas?.length > 0 || offerta.laureas?.length > 0 || offerta.attestatoes?.length > 0) && (
              <div className="card shadow-sm mb-4">
                <div className="card-header text-white" style={{background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'}}>
                  <h5 className="card-title mb-0">
                    <i className="bi bi-mortarboard me-2"></i>
                    Requisiti Formativi
                  </h5>
                </div>
                <div className="card-body">
                  {offerta.diplomas?.length > 0 && (
                    <div className="mb-3">
                      <h6 className="text-muted">DIPLOMI RICHIESTI</h6>
                      <ul className="list-unstyled">
                        {offerta.diplomas.map((diploma) => (
                          <li key={diploma.id} className="mb-1">
                            <i className="bi bi-award text-primary me-2"></i>
                            {diploma.nome}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {offerta.laureas?.length > 0 && (
                    <div className="mb-3">
                      <h6 className="text-muted">LAUREE RICHIESTE</h6>
                      <ul className="list-unstyled">
                        {offerta.laureas.map((laurea) => (
                          <li key={laurea.id} className="mb-1">
                            <i className="bi bi-mortarboard text-success me-2"></i>
                            {laurea.nome}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {offerta.attestatoes?.length > 0 && (
                    <div className="mb-3">
                      <h6 className="text-muted">ATTESTATI RICHIESTI</h6>
                      <ul className="list-unstyled">
                        {offerta.attestatoes.map((attestato) => (
                          <li key={attestato.id} className="mb-1">
                            <i className="bi bi-patch-check text-warning me-2"></i>
                            {attestato.nome}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Quiz Associato */}
            {offerta.quiz && (
              <div className="card shadow-sm mb-4">
                <div className="card-header bg-warning text-dark">
                  <h5 className="card-title mb-0">
                    <i className="bi bi-question-circle me-2"></i>
                    Quiz Richiesto
                  </h5>
                </div>
                <div className="card-body">
                  <div className="alert alert-info">
                    <i className="bi bi-info-circle me-2"></i>
                    Questa offerta richiede il completamento e il superamento di un quiz prima di poter inviare la candidatura.
                  </div>
                  <p><strong>Numero di domande:</strong> {offerta.quiz.domanda?.length || 'N/A'}</p>
                  {offerta.quiz.descrizione && (
                    <p><strong>Descrizione:</strong> {offerta.quiz.descrizione}</p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar Azioni */}
          <div className="col-lg-4">
            {/* Sezione Compatibilità */}
            {compatibilita && (
              <div className="card shadow-sm mb-4">
                <div className="card-header text-white" style={{background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'}}>
                  <h5 className="card-title mb-0">
                    <i className="bi bi-graph-up me-2"></i>
                    Compatibilità Profilo
                  </h5>
                </div>
                <div className="card-body text-center">
                  <div className="mb-3">
                    <div className="display-4 fw-bold" style={{color: '#f093fb'}}>
                      {compatibilita.punteggio_totale}
                      <small className="fs-6 text-muted">/100</small>
                    </div>
                    <div className="progress mb-3" style={{height: '10px'}}>
                      <div 
                        className={`progress-bar ${
                          compatibilita.punteggio_totale >= 80 ? 'bg-success' :
                          compatibilita.punteggio_totale >= 60 ? 'bg-info' :
                          compatibilita.punteggio_totale >= 40 ? 'bg-warning' : 'bg-danger'
                        }`}
                        role="progressbar" 
                        style={{width: `${Math.min(100, compatibilita.punteggio_totale)}%`}}
                      ></div>
                    </div>
                  </div>
                  <p className="text-muted small mb-0">
                    {compatibilita.messaggio}
                  </p>
                </div>
              </div>
            )}
            
            <div className="card shadow-sm position-sticky" style={{ top: '20px' }}>
              <div className="card-header text-white" style={{background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'}}>
                <h5 className="card-title mb-0">
                  <i className="bi bi-send me-2"></i>
                  Azioni
                </h5>
              </div>
              <div className="card-body text-center">
                {candidaturaInviata ? (
                  <div className="alert alert-success">
                    <i className="bi bi-check-circle me-2"></i>
                    Candidatura già inviata!
                  </div>
                ) : (
                  <>
                    <h6 className="card-subtitle mb-3 text-muted">
                      Interessato a questa posizione?
                    </h6>
                    <button
                      className="btn btn-lg w-100 mb-3"
                      style={{background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white', border: 'none'}}
                      onClick={handleInviaCandidatura}
                      disabled={inviaLoading}
                    >
                      {inviaLoading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                          Invio in corso...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-send me-2"></i>
                          Invia Candidatura
                        </>
                      )}
                    </button>
                    {offerta.quiz && (
                      <div className="alert alert-warning small">
                        <i className="bi bi-exclamation-triangle me-2"></i>
                        Ricorda: devi completare il quiz associato prima di candidarti.
                      </div>
                    )}
                  </>
                )}
                
                <button
                  className="btn btn-outline-secondary w-100"
                  onClick={() => navigate(-1)}
                >
                  <i className="bi bi-arrow-left me-2"></i>
                  Torna Indietro
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DettagliOfferta;