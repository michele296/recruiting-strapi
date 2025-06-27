import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import '../styles/DashboardCandidato.css';
import logo from '../assets/logo.png';

const DashboardCandidato = () => {
  const [candidatoData, setCandidatoData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifiche, setNotifiche] = useState([]);
  const [colloquioSelezionato, setColloquioSelezionato] = useState(null);
  const [valutazioneSelezionata, setValutazioneSelezionata] = useState(null);
  const [portfolioData, setPortfolioData] = useState({ github: '', linkedin: '', altri_link: '' });
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [filtroOfferte, setFiltroOfferte] = useState({ azienda: '', stipendioMin: '', stipendioMax: '' });
  const [filtroCandidature, setFiltroCandidature] = useState({ stato: '', dataInizio: '', dataFine: '', colloquio: '', valutazione: '' });
  const navigate = useNavigate();

  useEffect(() => {
    const candidatoId = localStorage.getItem('candidatoId');
    const isLoggedIn = localStorage.getItem('isLoggedIn');

    if (!candidatoId || !isLoggedIn) {
      navigate('/login-candidato');
      return;
    }

    fetchCandidatoData(candidatoId);
  }, [navigate]);

const fetchCandidatoData = async (candidatoId) => {
  try {
    const [candidatoResponse, infoResponse] = await Promise.all([
      fetch(`http://localhost:1337/api/ottieni-candidato/${candidatoId}`),
      fetch(`http://localhost:1337/api/utente-candidato/${candidatoId}/info-completa`)
    ]);
    
    if (!candidatoResponse.ok || !infoResponse.ok) {
      throw new Error('Errore nel recupero dei dati');
    }

    const candidatoData = await candidatoResponse.json();
    const infoData = await infoResponse.json();
    
    // Combina i dati
    const combinedData = {
      candidato: candidatoData.candidato,
      offerteCompatibili: infoData.offerteCompatibili,
      candidature: infoData.candidature,
      diplomi: infoData.diplomi,
      lauree: infoData.lauree,
      attestati: infoData.attestati,
      pannelloNotifiche: infoData.pannelloNotifiche
    };
    
    setCandidatoData(combinedData);
    
    // Gestisci le notifiche correttamente
    const notificheData = infoData.pannelloNotifiche?.notifiche || [];
    setNotifiche(notificheData);
    
    // Inizializza i dati del portfolio
    setPortfolioData({
      github: candidatoData.candidato?.github || '',
      linkedin: candidatoData.candidato?.linkedin || '',
      altri_link: candidatoData.candidato?.altri_link || ''
    });
    
  } catch (error) {
    console.error('Errore nel fetch dei dati candidato:', error);
    alert('Errore nel caricamento dei dati');
  } finally {
    setLoading(false);
  }
};

  const handleLogout = () => {
    localStorage.removeItem('candidatoId');
    localStorage.removeItem('candidato');
    localStorage.removeItem('isLoggedIn');
    navigate('/login-candidato');
  };
  const handleViewOfferDetails = (offertaId) => {
  const candidatoId = localStorage.getItem('candidatoId');
  navigate(`/dettagli-offerta/${offertaId}?candidatoId=${candidatoId}`);
};
  //const handleGestioneFormazione = (candidatoId) => {
  //const candidatoId = localStorage.getItem('candidatoId');
  //navigate(`/gestione-formazione/${candidatoId}`);
//};
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('it-IT');
  };

  const getStatusColor = (stato) => {
    switch (stato?.toLowerCase()) {
      case 'accettata':
        return 'success';
      case 'rifiutata':
        return 'danger';
      case 'in_attesa':
      case 'in attesa':
        return 'warning';
      default:
        return 'secondary';
    }
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="text-center text-white">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Caricamento...</span>
          </div>
          <p className="mt-3">Caricamento dashboard...</p>
        </div>
      </div>
    );
  }

  if (!candidatoData) {
    return (
      <div className="dashboard-loading">
        <div className="text-center text-white">
          <h3>Errore nel caricamento dei dati</h3>
          <button className="btn btn-light mt-3" onClick={() => navigate('/login-candidato')}>
            Torna al Login
          </button>
        </div>
      </div>
    );
  }

const { candidato, offerteCompatibili, candidature, diplomi, lauree, attestati, pannelloNotifiche } = candidatoData || {};

 // Sostituisci tutte le funzioni render con queste versioni corrette:

const renderDashboardOverview = () => (
  <div className="dashboard-overview">
    {/* Statistics Cards */}
    <div className="stats-grid">
      <div className="stat-card">
        <div className="stat-icon candidate-bg">
          <i className="bi bi-briefcase"></i>
        </div>
        <div className="stat-content">
          <h3>{candidature?.length || 0}</h3>
          <p>Candidature Inviate</p>
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-icon success-bg">
          <i className="bi bi-check-circle"></i>
        </div>
        <div className="stat-content">
          <h3>{candidature?.filter(c => c.Stato === 'accettata').length || 0}</h3>
          <p>Candidature Accettate</p>
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-icon candidate-bg">
          <i className="bi bi-eye"></i>
        </div>
        <div className="stat-content">
          <h3>{offerteCompatibili?.length || 0}</h3>
          <p>Offerte Compatibili</p>
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-icon warning-bg">
          <i className="bi bi-bell"></i>
        </div>
        <div className="stat-content">
          <h3>{notifiche?.filter(n => !n.letta && !n.letto).length || 0}</h3>
          <p>Notifiche</p>
        </div>
      </div>
    </div>

    {/* Quick Sections */}
    <div className="quick-sections">
      {/* Recent Applications */}
      <div className="section-card">
        <h3><i className="bi bi-briefcase me-2"></i>Candidature Recenti</h3>
        <div className="quick-list">
          {candidature && candidature.length > 0 ? (
            candidature.slice(0, 3).map((candidatura) => (
              <div key={`candidatura-${candidatura.id || Math.random()}`} className="quick-item">
                <div>
                  <div className="item-title">
                    {candidatura.offerta?.tipo_contratto || 'Posizione non specificata'}
                  </div>
                  <div className="item-subtitle">
                    Candidatura del {formatDate(candidatura.data_candidatura)}
                  </div>
                </div>
                <span className={`badge bg-${getStatusColor(candidatura.Stato)}`}>
                  {candidatura.Stato || 'In attesa'}
                </span>
              </div>
            ))
          ) : (
            <div key="no-candidature" className="quick-item">
              <div className="item-title text-muted">
                Nessuna candidatura ancora inviata
              </div>
            </div>
          )}
        </div>
        <button 
          className="btn w-100"
          style={{background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white', border: 'none', borderRadius: '8px', padding: '0.75rem 1.5rem', fontWeight: '500'}}
          onClick={() => setActiveSection('candidature')}
        >
          Vedi Tutte le Candidature
        </button>
      </div>

      {/* Compatible Offers */}
      <div className="section-card">
        <h3><i className="bi bi-search me-2"></i>Offerte Compatibili</h3>
        <div className="quick-list">
          {offerteCompatibili && offerteCompatibili.length > 0 ? (
            offerteCompatibili.slice(0, 3).map((offerta) => (
              <div key={`offerta-${offerta.id || Math.random()}`} className="quick-item">
                <div>
                  <div className="item-title">{offerta.info || 'Offerta di lavoro'}</div>
                  <div className="item-subtitle"><strong>{offerta.tipo_contratto}</strong></div>
                  <div className="item-subtitle">
                    {offerta.Provincia} • €{offerta.stipendio || 'N/A'}
                  </div>
                </div>
                <span className="badge" style={{background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white'}}>Nuova</span>
              </div>
            ))
          ) : (
            <div key="no-offerte" className="quick-item">
              <div className="item-title text-muted">
                Nessuna offerta compatibile trovata
              </div>
            </div>
          )}
        </div>
        <button 
          className="btn w-100"
          style={{background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white', border: 'none', borderRadius: '8px', padding: '0.75rem 1.5rem', fontWeight: '500'}}
          onClick={() => setActiveSection('offerte')}
        >
          Vedi Tutte le Offerte
        </button>
      </div>
    </div>
  </div>
);

const renderCandidature = () => {
  const candidatureFiltrate = candidature?.filter(candidatura => {
    if (filtroCandidature.stato && candidatura.Stato !== filtroCandidature.stato) return false;
    if (filtroCandidature.dataInizio && new Date(candidatura.data_candidatura) < new Date(filtroCandidature.dataInizio)) return false;
    if (filtroCandidature.dataFine && new Date(candidatura.data_candidatura) > new Date(filtroCandidature.dataFine)) return false;
    if (filtroCandidature.colloquio === 'si' && !candidatura.data_colloquio) return false;
    if (filtroCandidature.colloquio === 'no' && candidatura.data_colloquio) return false;
    if (filtroCandidature.valutazione === 'si' && (!candidatura.valutaziones || candidatura.valutaziones.length === 0)) return false;
    if (filtroCandidature.valutazione === 'no' && candidatura.valutaziones && candidatura.valutaziones.length > 0) return false;
    return true;
  }) || [];

  return (
    <div className="candidature-section">
      <h2><i className="bi bi-briefcase me-2"></i>Le Mie Candidature</h2>
      
      {/* Filtri */}
      <div className="card mb-4">
        <div className="card-body">
          <h6 className="card-title"><i className="bi bi-funnel me-2"></i>Filtri</h6>
          <div className="row mb-3">
            <div className="col-md-3">
              <select 
                className="form-select form-select-sm"
                value={filtroCandidature.stato}
                onChange={(e) => setFiltroCandidature({...filtroCandidature, stato: e.target.value})}
              >
                <option value="">Tutti gli stati</option>
                <option value="in_attesa">In attesa</option>
                <option value="accettata">Accettata</option>
                <option value="rifiutata">Rifiutata</option>
              </select>
            </div>
            <div className="col-md-3">
              <input 
                type="date" 
                className="form-control form-control-sm"
                placeholder="Data inizio"
                value={filtroCandidature.dataInizio}
                onChange={(e) => setFiltroCandidature({...filtroCandidature, dataInizio: e.target.value})}
              />
            </div>
            <div className="col-md-3">
              <input 
                type="date" 
                className="form-control form-control-sm"
                placeholder="Data fine"
                value={filtroCandidature.dataFine}
                onChange={(e) => setFiltroCandidature({...filtroCandidature, dataFine: e.target.value})}
              />
            </div>
            <div className="col-md-3">
              <select 
                className="form-select form-select-sm"
                value={filtroCandidature.colloquio}
                onChange={(e) => setFiltroCandidature({...filtroCandidature, colloquio: e.target.value})}
              >
                <option value="">Colloquio</option>
                <option value="si">Con colloquio</option>
                <option value="no">Senza colloquio</option>
              </select>
            </div>
          </div>
          <div className="row">
            <div className="col-md-3">
              <select 
                className="form-select form-select-sm"
                value={filtroCandidature.valutazione}
                onChange={(e) => setFiltroCandidature({...filtroCandidature, valutazione: e.target.value})}
              >
                <option value="">Valutazione</option>
                <option value="si">Con valutazione</option>
                <option value="no">Senza valutazione</option>
              </select>
            </div>
          </div>
        </div>
      </div>
      
      {candidatureFiltrate.length > 0 ? (
        <div className="row">
          {candidatureFiltrate.map((candidatura) => (
          <div key={`candidatura-detail-${candidatura.id || Math.random()}`} className="col-md-6 col-lg-4 mb-4">
            <div className="card h-100">
              <div className="card-body">
                <h5 className="card-title">
                  {candidatura.offerta?.tipo_contratto || 'Posizione non specificata'}
                </h5>
                <p className="card-text">
                  <strong>Provincia:</strong> {candidatura.offerta?.Provincia || 'N/A'}<br/>
                  <strong>Stipendio:</strong> €{candidatura.offerta?.stipendio || 'N/A'}<br/>
                  <strong>Data candidatura:</strong> {formatDate(candidatura.data_candidatura)}
                </p>
                <span className={`badge bg-${getStatusColor(candidatura.Stato)} fs-6 mb-2`}>
                  {candidatura.Stato || 'In attesa'}
                </span>
                <div className="mt-2 d-flex gap-2">
                  {candidatura.data_colloquio && (
                    <button 
                      className="btn btn-sm flex-fill"
                      style={{background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white', border: 'none'}}
                      onClick={() => handleViewColloquio(candidatura)}
                    >
                      <i className="bi bi-calendar-event me-1"></i>
                      Colloquio
                    </button>
                  )}
                  {candidatura.valutaziones && candidatura.valutaziones.length > 0 && (
                    <button 
                      className="btn btn-sm btn-outline-primary flex-fill"
                      onClick={() => handleViewValutazione(candidatura.valutaziones[0])}
                    >
                      <i className="bi bi-clipboard-data me-1"></i>
                      Valutazione
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    ) : (
      <div className="text-center py-5">
        <i className="bi bi-briefcase display-1 text-muted"></i>
        <h4 className="mt-3 text-muted">Nessuna candidatura trovata</h4>
        <p className="text-muted">Non ci sono candidature che corrispondono ai filtri selezionati</p>
      </div>
    )}
  </div>
  );
};

const renderOfferte = () => {
  const offerteFiltrate = offerteCompatibili?.filter(offerta => {
    if (filtroOfferte.azienda && !offerta.utente_aziendale?.azienda?.Nome?.toLowerCase().includes(filtroOfferte.azienda.toLowerCase())) return false;
    if (filtroOfferte.stipendioMin && offerta.stipendio < parseInt(filtroOfferte.stipendioMin)) return false;
    if (filtroOfferte.stipendioMax && offerta.stipendio > parseInt(filtroOfferte.stipendioMax)) return false;
    return true;
  }) || [];

  return (
    <div className="offerte-section">
      <h2><i className="bi bi-search me-2"></i>Offerte Compatibili</h2>
      
      {/* Filtri */}
      <div className="card mb-4">
        <div className="card-body">
          <h6 className="card-title"><i className="bi bi-funnel me-2"></i>Filtri</h6>
          <div className="row">
            <div className="col-md-4">
              <input 
                type="text" 
                className="form-control form-control-sm"
                placeholder="Nome azienda"
                value={filtroOfferte.azienda}
                onChange={(e) => setFiltroOfferte({...filtroOfferte, azienda: e.target.value})}
              />
            </div>
            <div className="col-md-4">
              <input 
                type="number" 
                className="form-control form-control-sm"
                placeholder="Stipendio minimo"
                value={filtroOfferte.stipendioMin}
                onChange={(e) => setFiltroOfferte({...filtroOfferte, stipendioMin: e.target.value})}
              />
            </div>
            <div className="col-md-4">
              <input 
                type="number" 
                className="form-control form-control-sm"
                placeholder="Stipendio massimo"
                value={filtroOfferte.stipendioMax}
                onChange={(e) => setFiltroOfferte({...filtroOfferte, stipendioMax: e.target.value})}
              />
            </div>
          </div>
        </div>
      </div>
      
      {offerteFiltrate.length > 0 ? (
        <div className="row">
          {offerteFiltrate.map((offerta) => (
          <div key={`offerta-detail-${offerta.id || Math.random()}`} className="col-md-6 col-lg-4 mb-4">
            <div className="card h-100">
              <div className="card-body">
                <h5 className="card-title">{offerta.info || 'Offerta di lavoro'}</h5>
                <p className="mb-2"><strong>Tipo contratto:</strong> {offerta.tipo_contratto}</p>
                <p className="card-text">
                  <strong>Provincia:</strong> {offerta.Provincia}<br/>
                  <strong>Stipendio:</strong> €{offerta.stipendio || 'N/A'}<br/>
                  <strong>Benefit:</strong> {offerta.benefit || 'N/A'}<br />
                  <strong>Azienda:</strong> {offerta.utente_aziendale?.azienda?.Nome || offerta.azienda?.Nome || 'N/A'}
                </p>
                <button 
                  className="btn w-100"
                  style={{background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white', border: 'none', borderRadius: '8px', padding: '0.75rem 1.5rem', fontWeight: '500'}}
                  onClick={() => handleViewOfferDetails(offerta.id)}
                >
                  <i className="bi bi-eye me-1"></i>Visualizza Dettagli
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    ) : (
      <div className="text-center py-5">
        <i className="bi bi-search display-1 text-muted"></i>
        <h4 className="mt-3 text-muted">Nessuna offerta trovata</h4>
        <p className="text-muted">Non ci sono offerte che corrispondono ai filtri selezionati</p>
      </div>
    )}
  </div>
  );
};
 const renderProfilo = () => {
  if (activeSection !== 'profilo') return null;
  
  return (
    <div className="profilo-section">
      <h2><i className="bi bi-person me-2"></i>Il Mio Profilo</h2>
      <div className="row">
        <div className="col-md-8">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">Informazioni Personali</h5>
              <div className="row">
                <div className="col-md-6">
                  <p><strong>Nome:</strong> {candidato.Nome}</p>
                  <p><strong>Cognome:</strong> {candidato.Cognome}</p>
                  <p><strong>Email:</strong> {candidato.Email}</p>
                </div>
                <div className="col-md-6">
                  <p><strong>Data di nascita:</strong> {formatDate(candidato.DataDiNascita)}</p>
                  <p><strong>Città:</strong> {candidato.Citta}</p>
                  <p><strong>Provincia:</strong> {candidato.Provincia}</p>
                  <p><strong>Nazione:</strong> {candidato.Nazione}</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* CV Section */}
          {candidato.CV && (
            <div className="card mt-4">
              <div className="card-body">
                <h5 className="card-title"><i className="bi bi-file-earmark-pdf me-2"></i>Curriculum Vitae</h5>
                <div className="d-flex align-items-center justify-content-between p-3 bg-light rounded">
                  <div className="d-flex align-items-center">
                    <i className="bi bi-file-earmark-pdf fs-2 text-danger me-3"></i>
                    <div>
                      <h6 className="mb-1">{candidato.CV.name || 'curriculum.pdf'}</h6>
                      <small className="text-muted">Caricato il {formatDate(candidato.CV.createdAt)}</small>
                    </div>
                  </div>
                  <div className="d-flex gap-2">
                    <a 
                      href={`http://localhost:1337${candidato.CV.url}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-sm btn-outline-primary"
                    >
                      <i className="bi bi-eye me-1"></i> Visualizza
                    </a>
                    <a 
                      href={`http://localhost:1337${candidato.CV.url}`}
                      download
                      className="btn btn-sm btn-outline-success"
                    >
                      <i className="bi bi-download me-1"></i> Scarica
                    </a>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Sezione Cambia Password */}
          <div className="card mt-4">
            <div className="card-body">
              <h5 className="card-title"><i className="bi bi-shield-lock me-2"></i>Cambia Password</h5>
              <form onSubmit={async (e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                try {
                  const response = await fetch('http://localhost:1337/api/cambia-password', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      email: candidato.Email,
                      vecchiaPassword: formData.get('vecchiaPassword'),
                      nuovaPassword: formData.get('nuovaPassword')
                    })
                  });
                  if (response.ok) {
                    alert('Password cambiata con successo!');
                    e.target.reset();
                  } else {
                    const error = await response.json();
                    alert(error.error?.message || 'Errore nel cambio password');
                  }
                } catch (error) {
                  alert('Errore nel cambio password');
                }
              }}>
                <div className="row">
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label">Vecchia Password</label>
                      <input type="password" name="vecchiaPassword" className="form-control" required />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label">Nuova Password</label>
                      <input type="password" name="nuovaPassword" className="form-control" required />
                    </div>
                  </div>
                </div>
                <button type="submit" className="btn" style={{background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white', border: 'none'}}>
                  <i className="bi bi-shield-check me-2"></i>Cambia Password
                </button>
              </form>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card">
            <div className="card-body text-center">
              <i className="bi bi-person-circle display-1 text-muted"></i>
              <h5 className="mt-3">{candidato.Nome} {candidato.Cognome}</h5>
              <p className="text-muted">Candidato</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
const renderFormazione = () => {
  if (activeSection !== 'formazione') return null;
  
  return (
    <div className="formazione-section">
    <div className="d-flex justify-content-between align-items-center mb-4">
      <h2><i className="bi bi-mortarboard me-2"></i>Formazione</h2>
      <button 
        className="btn btn-primary"
        onClick={() => {
          const candidatoId = localStorage.getItem('candidatoId');
          navigate(`/gestione-formazione/${candidatoId}`);
        }}
        style={{
          background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
          border: 'none',
          borderRadius: '8px',
          padding: '0.75rem 1.5rem',
          fontWeight: '500'
        }}
      >
        <i className="bi bi-plus-circle me-2"></i>
        Gestisci le tue Competenze
      </button>
    </div>
    
    {/* Diplomi */}
    {diplomi && diplomi.length > 0 && (
      <div className="mb-4">
        <h4><i className="bi bi-award me-2"></i>Diplomi</h4>
        <div className="row">
          {diplomi.map((diploma) => (
            <div key={`diploma-${diploma.id || Math.random()}`} className="col-md-6 mb-3">
              <div className="card">
                <div className="card-body">
                  <h6 className="card-title">{diploma.nome}</h6>
                  <p className="card-text">
                    <strong>Voto:</strong> {diploma.voto}<br/>
                    {diploma.scuola && (
                      <><strong>Scuola:</strong> {diploma.scuola.nome}</>
                    )}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )}

    {/* Lauree */}
    {lauree && lauree.length > 0 && (
      <div className="mb-4">
        <h4><i className="bi bi-mortarboard me-2"></i>Lauree</h4>
        <div className="row">
          {lauree.map((laurea) => (
            <div key={`laurea-${laurea.id || Math.random()}`} className="col-md-6 mb-3">
              <div className="card">
                <div className="card-body">
                  <h6 className="card-title">{laurea.nome}</h6>
                  <p className="card-text">
                    <strong>Voto:</strong> {laurea.voto}<br/>
                    {laurea.universita && (
                      <><strong>Università:</strong> {laurea.universita.nome}</>
                    )}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )}

    {/* Attestati */}
    {attestati && attestati.length > 0 && (
      <div className="mb-4">
        <h4><i className="bi bi-patch-check me-2"></i>Attestati</h4>
        <div className="row">
          {attestati.map((attestato) => (
            <div key={`attestato-${attestato.id || Math.random()}`} className="col-md-6 mb-3">
              <div className="card">
                <div className="card-body">
                  <h6 className="card-title">{attestato.nome}</h6>
                  <p className="card-text">
                    <strong>Livello:</strong> {attestato.livello || 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )}

    {(!diplomi || diplomi.length === 0) && 
     (!lauree || lauree.length === 0) && 
     (!attestati || attestati.length === 0) && (
      <div className="text-center py-5">
        <i className="bi bi-mortarboard display-1 text-muted"></i>
        <h4 className="mt-3 text-muted">Nessuna formazione trovata</h4>
        <p className="text-muted">Non hai ancora aggiunto informazioni sulla tua formazione</p>
      </div>
    )}
    </div>
  );
};

const renderNotifiche = () => {
  // Aggiungi debug per verificare i dati delle notifiche
  console.log('Rendering notifiche:', notifiche);
  
  return (
    <div className="notifiche-section">
      <h2><i className="bi bi-bell me-2"></i>Notifiche</h2>
      {notifiche && notifiche.length > 0 ? (
        <div className="row">
          {notifiche.sort((a, b) => {
            const aLetta = a.letta || a.letto;
            const bLetta = b.letta || b.letto;
            if (aLetta === bLetta) return 0;
            return aLetta ? 1 : -1;
          }).map((notifica) => {
            // Debug per ogni notifica
            console.log(`Notifica ${notifica.id}:`, {
              letta: notifica.letta,
              letto: notifica.letto,
              allData: notifica
            });
            
            // Controlla sia 'letta' che 'letto' per compatibilità
            const isRead = notifica.letta || notifica.letto;
            
            return (
              <div key={`notifica-${notifica.id || Math.random()}`} className="col-12 mb-3">
                <div className={`card ${!isRead ? 'border-3' : ''}`} style={!isRead ? {borderColor: '#f093fb'} : {}}>
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-start">
                      <div className="flex-grow-1">
                        <h5 className="card-title d-flex align-items-center">
                          {!isRead && (
                            <i className="bi bi-circle-fill me-2" style={{ fontSize: '0.5rem', color: '#f093fb' }}></i>
                          )}
                          {notifica.titolo || 'Notifica'}
                        </h5>
                        <p className="card-text">{notifica.messaggio || notifica.contenuto}</p>
                        {notifica.data && (
                          <small className="text-muted">
                            <i className="bi bi-calendar me-1"></i>
                            {formatDate(notifica.data)}
                          </small>
                        )}
                      </div>
                      <div className="d-flex flex-column align-items-end gap-2">
                        <div>
                          {isRead ? (
                            <span className="badge bg-secondary">
                              <i className="bi bi-check-circle me-1"></i>
                              Letta
                            </span>
                          ) : (
                            <span className="badge" style={{background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white'}}>
                              <i className="bi bi-circle me-1"></i>
                              Non letta
                            </span>
                          )}
                        </div>
                        {!isRead && (
                          <button 
                            className="btn btn-sm"
                            style={{border: '1px solid #f093fb', color: '#f093fb'}}
                            onClick={() => handleMarkAsRead(notifica.id)}
                            title="Segna come letta"
                          >
                            <i className="bi bi-check me-1"></i>
                            Segna come letta
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-5">
          <i className="bi bi-bell display-1 text-muted"></i>
          <h4 className="mt-3 text-muted">Nessuna notifica</h4>
          <p className="text-muted">Non hai notifiche al momento</p>
        </div>
      )}
    </div>
  );
};
// Funzione per visualizzare i dettagli del colloquio
const handleViewColloquio = (candidatura) => {
  setColloquioSelezionato(candidatura);
  setActiveSection('colloquio');
};

// Funzione per chiudere la visualizzazione del colloquio
const handleCloseColloquio = () => {
  setColloquioSelezionato(null);
  setActiveSection('candidature');
};

// Funzione per visualizzare i dettagli della valutazione
const handleViewValutazione = (valutazione) => {
  setValutazioneSelezionata(valutazione);
  setActiveSection('valutazione');
};

// Funzione per chiudere la visualizzazione della valutazione
const handleCloseValutazione = () => {
  setValutazioneSelezionata(null);
  setActiveSection('candidature');
};

const handleMarkAsRead = async (notificaId) => {
  try {
    const response = await fetch(`http://localhost:1337/api/stato-notifica/${notificaId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Errore nell\'aggiornamento della notifica');
    }

    // Aggiorna lo stato locale delle notifiche
    setNotifiche(prevNotifiche => 
      prevNotifiche.map(notifica => 
        notifica.id === notificaId 
          ? { ...notifica, letta: true } 
          : notifica
      )
    );

    // Mostra un messaggio di successo (opzionale)
    console.log('Notifica segnata come letta');
    
  } catch (error) {
    console.error('Errore nel segnare la notifica come letta:', error);
    alert('Errore nell\'aggiornamento della notifica');
  }
};
// Funzione per renderizzare i dettagli del colloquio
const renderColloquio = () => {
  if (!colloquioSelezionato) return null;
  
  const dataColloquio = new Date(colloquioSelezionato.data_colloquio).toLocaleString('it-IT');
  const infoColloquio = colloquioSelezionato.info_colloquio || 'Nessuna informazione aggiuntiva';
  
  return (
    <div className="colloquio-section">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2><i className="bi bi-calendar-event me-2"></i>Dettagli Colloquio</h2>
        <button 
          className="btn"
          style={{
            background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            padding: '0.5rem 1rem'
          }}
          onClick={handleCloseColloquio}
        >
          <i className="bi bi-arrow-left me-2"></i>
          Torna alle Candidature
        </button>
      </div>
      
      <div className="card shadow-sm mb-4">
        <div className="card-header text-white" style={{background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'}}>
          <h5 className="card-title mb-0">
            <i className="bi bi-briefcase me-2"></i>
            {colloquioSelezionato.offerta?.tipo_contratto || 'Posizione non specificata'}
          </h5>
        </div>
        <div className="card-body">
          <div className="row">
            <div className="col-md-6">
              <h6 className="text-muted mb-3">INFORMAZIONI COLLOQUIO</h6>
              <p>
                <i className="bi bi-calendar-date me-2 text-primary"></i>
                <strong>Data e ora:</strong> {dataColloquio}
              </p>
              <p>
                <i className="bi bi-geo-alt me-2 text-danger"></i>
                <strong>Azienda:</strong> {colloquioSelezionato.offerta?.utente_aziendale?.azienda?.Nome || colloquioSelezionato.offerta?.azienda?.Nome || 'N/A'}
              </p>
              <p>
                <i className="bi bi-building me-2 text-success"></i>
                <strong>Provincia:</strong> {colloquioSelezionato.offerta?.Provincia || 'N/A'}
              </p>
            </div>
            <div className="col-md-6">
              <h6 className="text-muted mb-3">DETTAGLI AGGIUNTIVI</h6>
              <div className="p-3 bg-light rounded">
                <p className="mb-0">
                  <i className="bi bi-info-circle me-2 text-info"></i>
                  <strong>Informazioni:</strong>
                </p>
                <p className="mt-2 mb-0">{infoColloquio}</p>
              </div>
            </div>
          </div>
          
          <div className="alert alert-info mt-4">
            <i className="bi bi-lightbulb me-2"></i>
            <strong>Suggerimento:</strong> Ricordati di prepararti adeguatamente per il colloquio. Porta con te il tuo curriculum e arriva con qualche minuto di anticipo.
          </div>
        </div>
      </div>
    </div>
  );
};

// Funzione per renderizzare i dettagli della valutazione
const renderValutazione = () => {
  if (!valutazioneSelezionata) return null;
  
  const dataValutazione = new Date(valutazioneSelezionata.data_valutazione).toLocaleDateString('it-IT');
  const nomeAzienda = valutazioneSelezionata.utente_aziendale?.azienda?.Nome || 'Azienda';
  
  return (
    <div className="valutazione-section">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2><i className="bi bi-clipboard-data me-2"></i>Dettagli Valutazione</h2>
        <button 
          className="btn"
          style={{
            background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            padding: '0.5rem 1rem'
          }}
          onClick={handleCloseValutazione}
        >
          <i className="bi bi-arrow-left me-2"></i>
          Torna alle Candidature
        </button>
      </div>
      
      <div className="card shadow-sm mb-4">
        <div className="card-header text-white" style={{background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'}}>
          <h5 className="card-title mb-0">
            <i className="bi bi-building me-2"></i>
            Valutazione da {nomeAzienda}
          </h5>
        </div>
        <div className="card-body">
          <div className="row">
            <div className="col-md-6">
              <h6 className="text-muted mb-3">PUNTEGGI</h6>
              <div className="mb-3">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span><strong>Valutazione Tecnica:</strong></span>
                  <span className="badge bg-primary fs-6">{valutazioneSelezionata.valutazione_tecnica}/10</span>
                </div>
                <div className="progress mb-3" style={{height: '8px'}}>
                  <div 
                    className="progress-bar bg-primary" 
                    style={{width: `${(valutazioneSelezionata.valutazione_tecnica / 10) * 100}%`}}
                  ></div>
                </div>
              </div>
              
              <div className="mb-3">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span><strong>Valutazione Soft Skills:</strong></span>
                  <span className="badge bg-info fs-6">{valutazioneSelezionata.valutazione_soft}/10</span>
                </div>
                <div className="progress mb-3" style={{height: '8px'}}>
                  <div 
                    className="progress-bar bg-info" 
                    style={{width: `${(valutazioneSelezionata.valutazione_soft / 10) * 100}%`}}
                  ></div>
                </div>
              </div>
              
              <p>
                <i className="bi bi-calendar-date me-2 text-success"></i>
                <strong>Data valutazione:</strong> {dataValutazione}
              </p>
            </div>
            
            <div className="col-md-6">
              <h6 className="text-muted mb-3">FEEDBACK</h6>
              <div className="p-3 bg-light rounded mb-3">
                <p className="mb-1">
                  <i className="bi bi-chat-text me-2 text-primary"></i>
                  <strong>Motivazione:</strong>
                </p>
                <p className="mb-0">{valutazioneSelezionata.motivazione}</p>
              </div>
              

            </div>
          </div>
          
          <div className="alert alert-info mt-4">
            <i className="bi bi-info-circle me-2"></i>
            <strong>Informazione:</strong> Questa valutazione è stata fornita dall'azienda per aiutarti a comprendere i punti di forza e le aree di miglioramento della tua candidatura.
          </div>
          
          <div className="alert alert-success mt-3">
            <i className="bi bi-envelope-check me-2"></i>
            <strong>Candidatura Accettata:</strong> Se la tua candidatura è stata accettata, sarai contattato al più presto dall'azienda tramite email per i prossimi passi.
          </div>
        </div>
      </div>
    </div>
  );
};

const handleSavePortfolio = async () => {
    setSaving(true);
    try {
      const candidatoId = localStorage.getItem('candidatoId');
      const formData = new FormData();
      formData.append('github', portfolioData.github);
      formData.append('linkedin', portfolioData.linkedin);
      formData.append('altri_link', portfolioData.altri_link);

      const response = await fetch(`http://localhost:1337/api/inserisci-cv/${candidatoId}`, {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        alert('Portfolio aggiornato con successo!');
        setIsEditing(false);
        fetchCandidatoData(candidatoId);
      }
    } catch (error) {
      console.error('Errore aggiornamento portfolio:', error);
      alert('Errore nell\'aggiornamento del portfolio');
    } finally {
      setSaving(false);
    }
  };

const renderPortfolio = () => {
  return (
    <div className="portfolio-section">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2><i className="bi bi-folder me-2"></i>Portfolio e Consigli</h2>
        <button 
          className="btn"
          style={{
            background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            padding: '0.75rem 1.5rem'
          }}
          onClick={() => setIsEditing(!isEditing)}
        >
          <i className={`bi ${isEditing ? 'bi-x' : 'bi-pencil'} me-2`}></i>
          {isEditing ? 'Annulla' : 'Modifica'}
        </button>
      </div>
      
      <div className="alert alert-info mb-4">
        <div className="d-flex align-items-center">
          <i className="bi bi-info-circle fs-4 me-3"></i>
          <div>
            <h6 className="mb-1">Costruisci il tuo Portfolio Professionale</h6>
            <small>Un portfolio ben curato può fare la differenza nella tua ricerca di lavoro. Segui i nostri consigli per creare un portfolio che catturi l'attenzione dei recruiter.</small>
          </div>
        </div>
      </div>
      
      <div className="row">
        <div className="col-md-8">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title"><i className="bi bi-link-45deg me-2"></i>I Tuoi Link</h5>
              
              {isEditing ? (
                <>
                  <div className="mb-3">
                    <label className="form-label">GitHub</label>
                    <input 
                      type="url" 
                      className="form-control" 
                      value={portfolioData.github}
                      onChange={(e) => setPortfolioData({...portfolioData, github: e.target.value})}
                      placeholder="https://github.com/tuousername"
                    />
                  </div>
                  
                  <div className="mb-3">
                    <label className="form-label">LinkedIn</label>
                    <input 
                      type="url" 
                      className="form-control" 
                      value={portfolioData.linkedin}
                      onChange={(e) => setPortfolioData({...portfolioData, linkedin: e.target.value})}
                      placeholder="https://linkedin.com/in/tuoprofilo"
                    />
                  </div>
                  
                  <div className="mb-3">
                    <label className="form-label">Altri Link (uno per riga)</label>
                    <textarea 
                      className="form-control" 
                      rows="4"
                      value={portfolioData.altri_link}
                      onChange={(e) => setPortfolioData({...portfolioData, altri_link: e.target.value})}
                      placeholder="https://tuoportfolio.com\nhttps://tuoblog.com\nhttps://altrolink.com"
                    />
                  </div>
                  
                  <button 
                    className="btn"
                    style={{
                      background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                      color: 'white',
                      border: 'none'
                    }}
                    onClick={handleSavePortfolio}
                    disabled={saving}
                  >
                    {saving ? 'Salvando...' : 'Salva Modifiche'}
                  </button>
                </>
              ) : (
                <>
                  {candidato.github && (
                    <div className="mb-3">
                      <strong>GitHub:</strong>
                      <a href={candidato.github} target="_blank" rel="noopener noreferrer" className="ms-2">
                        <i className="bi bi-github me-1"></i>{candidato.github}
                      </a>
                    </div>
                  )}
                  
                  {candidato.linkedin && (
                    <div className="mb-3">
                      <strong>LinkedIn:</strong>
                      <a href={candidato.linkedin} target="_blank" rel="noopener noreferrer" className="ms-2">
                        <i className="bi bi-linkedin me-1"></i>{candidato.linkedin}
                      </a>
                    </div>
                  )}
                  
                  {candidato.altri_link && (
                    <div className="mb-3">
                      <strong>Altri Link:</strong>
                      <div className="mt-2">
                        {candidato.altri_link.split('\n').filter(link => link.trim()).map((link, index) => (
                          <div key={index}>
                            <a href={link.trim()} target="_blank" rel="noopener noreferrer">
                              <i className="bi bi-link me-1"></i>{link.trim()}
                            </a>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {!candidato.github && !candidato.linkedin && !candidato.altri_link && (
                    <p className="text-muted">Nessun link aggiunto. Clicca su "Modifica" per aggiungere i tuoi link.</p>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
        
      </div>
      
      {/* Sezione Consigli a tutto schermo */}
      <div className="mt-5">
        <div className="text-center mb-4">
          <h3 style={{background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'}}>
            <i className="bi bi-lightbulb me-2"></i>Consigli per un Portfolio Vincente
          </h3>
          <p className="text-muted">Segui questi 7 consigli per creare un portfolio che fa la differenza</p>
        </div>
        
        <div className="row g-4">
          <div className="col-md-6 col-lg-4">
            <div className="card h-100 shadow-sm" style={{borderTop: '4px solid #f093fb'}}>
              <div className="card-body text-center">
                <div className="mb-3">
                  <i className="bi bi-target" style={{fontSize: '3rem', color: '#f093fb'}}></i>
                </div>
                <h5 className="card-title">1. Definisci il tuo obiettivo</h5>
                <p className="card-text">Chiediti: a chi è rivolto il mio portfolio? Rifletti sulle competenze rilevanti per le posizioni a cui ti candidi.</p>
              </div>
            </div>
          </div>
          
          <div className="col-md-6 col-lg-4">
            <div className="card h-100 shadow-sm" style={{borderTop: '4px solid #f5576c'}}>
              <div className="card-body text-center">
                <div className="mb-3">
                  <i className="bi bi-star-fill" style={{fontSize: '3rem', color: '#f5576c'}}></i>
                </div>
                <h5 className="card-title">2. Mostra solo i migliori</h5>
                <p className="card-text">Seleziona 4-6 progetti significativi, ben documentati e rappresentativi. Qualità > Quantità.</p>
              </div>
            </div>
          </div>
          
          <div className="col-md-6 col-lg-4">
            <div className="card h-100 shadow-sm" style={{borderTop: '4px solid #667eea'}}>
              <div className="card-body text-center">
                <div className="mb-3">
                  <i className="bi bi-chat-text-fill" style={{fontSize: '3rem', color: '#667eea'}}></i>
                </div>
                <h5 className="card-title">3. Accompagna con spiegazioni</h5>
                <p className="card-text">Racconta il processo dietro al lavoro. Chi guarda vuole capire come pensi, non solo cosa hai fatto.</p>
              </div>
            </div>
          </div>
          
          <div className="col-md-6 col-lg-4">
            <div className="card h-100 shadow-sm" style={{borderTop: '4px solid #764ba2'}}>
              <div className="card-body text-center">
                <div className="mb-3">
                  <i className="bi bi-palette-fill" style={{fontSize: '3rem', color: '#764ba2'}}></i>
                </div>
                <h5 className="card-title">4. Cura design e struttura</h5>
                <p className="card-text">Mantieni un design pulito, leggibile e coerente. Se non sei designer, usa template predefiniti.</p>
              </div>
            </div>
          </div>
          
          <div className="col-md-6 col-lg-4">
            <div className="card h-100 shadow-sm" style={{borderTop: '4px solid #f093fb'}}>
              <div className="card-body text-center">
                <div className="mb-3">
                  <i className="bi bi-person-badge-fill" style={{fontSize: '3rem', color: '#f093fb'}}></i>
                </div>
                <h5 className="card-title">5. Sezione "Chi sono"</h5>
                <p className="card-text">Racconta brevemente chi sei, cosa fai e cosa cerchi. Aggiungi una foto professionale e i tuoi contatti.</p>
              </div>
            </div>
          </div>
          
          <div className="col-md-6 col-lg-4">
            <div className="card h-100 shadow-sm" style={{borderTop: '4px solid #f5576c'}}>
              <div className="card-body text-center">
                <div className="mb-3">
                  <i className="bi bi-arrow-clockwise" style={{fontSize: '3rem', color: '#f5576c'}}></i>
                </div>
                <h5 className="card-title">6. Mantienilo aggiornato</h5>
                <p className="card-text">Aggiungi nuovi progetti ogni 3-6 mesi, rimuovi quelli datati. Un portfolio curato comunica professionalità.</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="row mt-4">
          <div className="col-lg-8 mx-auto">
            <div className="card shadow-sm" style={{background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white'}}>
              <div className="card-body text-center">
                <div className="mb-3">
                  <i className="bi bi-bullseye" style={{fontSize: '3rem'}}></i>
                </div>
                <h5 className="card-title">7. Adatta il portfolio al ruolo</h5>
                <p className="card-text">Crea versioni ad hoc includendo solo i progetti più pertinenti per quella posizione. Dimostra di aver fatto uno sforzo extra!</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-5">
          <div className="text-center mb-4">
            <h4><i className="bi bi-globe me-2"></i>Piattaforme Consigliate</h4>
            <p className="text-muted">Scegli la piattaforma più adatta al tuo settore</p>
          </div>
          <div className="row justify-content-center">
            <div className="col-md-8">
              <div className="d-flex flex-wrap justify-content-center gap-3">
                <a href="https://behance.net" target="_blank" rel="noopener noreferrer" className="btn btn-outline-primary btn-lg">
                  <i className="bi bi-palette me-2"></i>Behance
                  <small className="d-block">Per creativi e designer</small>
                </a>
                <a href="https://dribbble.com" target="_blank" rel="noopener noreferrer" className="btn btn-outline-info btn-lg">
                  <i className="bi bi-dribbble me-2"></i>Dribbble
                  <small className="d-block">UI/UX e illustratori</small>
                </a>
                <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="btn btn-outline-dark btn-lg">
                  <i className="bi bi-github me-2"></i>GitHub
                  <small className="d-block">Per sviluppatori</small>
                </a>
                <a href="https://notion.so" target="_blank" rel="noopener noreferrer" className="btn btn-outline-secondary btn-lg">
                  <i className="bi bi-journal-text me-2"></i>Notion
                  <small className="d-block">Molto flessibile</small>
                </a>
              </div>
            </div>
          </div>
        </div>
        
        <div className="alert alert-warning mt-4">
          <div className="d-flex align-items-center">
            <i className="bi bi-exclamation-triangle fs-3 me-3"></i>
            <div>
              <h6 className="mb-1">Promemoria Importante</h6>
              <p className="mb-0">Mantieni il portfolio aggiornato ogni 3-6 mesi e adattalo sempre al ruolo specifico per cui ti candidi!</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};


const renderContent = () => {
  switch (activeSection) {
    case 'candidature':
      return renderCandidature();
    case 'offerte':
      return renderOfferte();
    case 'profilo':
      return renderProfilo();
    case 'formazione':
      return renderFormazione();
    case 'portfolio':
      return renderPortfolio();
    case 'notifiche':
      return renderNotifiche();
    case 'colloquio':
      return renderColloquio();
    case 'valutazione':
      return renderValutazione();
    default:
      return renderDashboardOverview();
  }
};

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <div className={`dashboard-sidebar ${sidebarOpen ? 'mobile-open' : ''}`} style={{background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'}}>
        <div className="sidebar-header">
          <img src={logo} alt="Logo" className="sidebar-logo" />
          <div className="user-info">
            <h4>{candidato.Nome} {candidato.Cognome}</h4>
            <p>{candidato.Email}</p>
          </div>
        </div>

        <nav className="sidebar-nav">
          <button 
            className={`nav-item ${activeSection === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveSection('dashboard')}
          >
            <i className="bi bi-speedometer2"></i>
            Dashboard
          </button>
          <button 
            className={`nav-item ${activeSection === 'candidature' ? 'active' : ''}`}
            onClick={() => setActiveSection('candidature')}
          >
            <i className="bi bi-briefcase"></i>
            Le Mie Candidature
          </button>
          <button 
            className={`nav-item ${activeSection === 'offerte' ? 'active' : ''}`}
            onClick={() => setActiveSection('offerte')}
          >
            <i className="bi bi-search"></i>
            Offerte Compatibili
          </button>
          <button 
            className={`nav-item ${activeSection === 'profilo' ? 'active' : ''}`}
            onClick={() => setActiveSection('profilo')}
          >
            <i className="bi bi-person"></i>
            Il Mio Profilo
          </button>
          <button 
            className={`nav-item ${activeSection === 'formazione' ? 'active' : ''}`}
            onClick={() => setActiveSection('formazione')}
          >
            <i className="bi bi-mortarboard"></i>
            Formazione
          </button>
          <button 
            className={`nav-item ${activeSection === 'portfolio' ? 'active' : ''}`}
            onClick={() => setActiveSection('portfolio')}
          >
            <i className="bi bi-folder"></i>
            Portfolio e Consigli
          </button>
        </nav>

        <div className="sidebar-footer">
          <Link to="/Homepage" className="home-link">
            <i className="bi bi-house"></i>
            Torna alla Home
          </Link>
          <button className="logout-btn" onClick={handleLogout}>
            <i className="bi bi-box-arrow-right"></i>
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="dashboard-main">
        <header className="main-header">
          <div className="d-flex align-items-center">
            <button 
              className="btn btn-link d-md-none me-2"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <i className="bi bi-list fs-4"></i>
            </button>
            <h1>
              {activeSection === 'dashboard' && 'Dashboard'}
              {activeSection === 'candidature' && 'Le Mie Candidature'}
              {activeSection === 'offerte' && 'Offerte Compatibili'}
              {activeSection === 'profilo' && 'Il Mio Profilo'}
              {activeSection === 'formazione' && 'Formazione'}
              {activeSection === 'portfolio' && 'Portfolio e Consigli'}
              {activeSection === 'notifiche' && 'Notifiche'}
              {activeSection === 'colloquio' && 'Dettagli Colloquio'}
              {activeSection === 'valutazione' && 'Dettagli Valutazione'}
            </h1>
          </div>
        <div className="notification-wrapper ms-auto position-relative">
  <button className="btn-notification btn btn-link p-0 border-0" onClick={() => setActiveSection('notifiche')}>
    <i className="bi bi-bell fs-4"></i>
    {notifiche.filter(n => !n.letta && !n.letto).length > 0 && (
      <span className="notification-badge position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
        {notifiche.filter(n => !n.letta && !n.letto).length}
      </span>
    )}
  </button>
</div>



        </header>

        <main className="main-content">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default DashboardCandidato;