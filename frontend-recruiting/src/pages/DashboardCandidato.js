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
    const response = await fetch(`http://localhost:1337/api/utente-candidato/${candidatoId}/info-completa`);
    
    if (!response.ok) {
      throw new Error('Errore nel recupero dei dati');
    }

    const data = await response.json();
    
    // Debug per vedere i dati ricevuti
    console.log('Dati ricevuti dal backend:', data);
    
    setCandidatoData(data);
    
    // Gestisci le notifiche correttamente
    const notificheData = data.pannelloNotifiche?.notifiche || [];
    console.log('Notifiche estratte:', notificheData);
    setNotifiche(notificheData);
    
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
                  <div className="item-title">{offerta.tipo_contratto}</div>
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

const renderCandidature = () => (
  <div className="candidature-section">
    <h2><i className="bi bi-briefcase me-2"></i>Le Mie Candidature</h2>
    {candidature && candidature.length > 0 ? (
      <div className="row">
        {candidature.map((candidatura) => (
          <div key={`candidatura-detail-${candidatura.id || Math.random()}`} className="col-md-6 col-lg-4 mb-4">
            <div className="card h-100">
              <div className="card-body">
                <h5 className="card-title">
                  {candidatura.offerta?.tipo_contratto || 'Posizione non specificata'}
                </h5>
                <p className="card-text">
                  <strong>Provincia:</strong> {candidatura.offerta?.Provincia || 'N/A'}<br/>
                  <strong>Stipendio:</strong> €{candidatura.offerta?.stipendio || 'N/A'}<br/>
                  <strong>Data candidatura:</strong> {formatDate(candidatura.data_candidatura)}<br/>
                  <strong>Quiz superato:</strong> {candidatura.quiz_superato ? 'Sì' : 'No'}
                </p>
                <span className={`badge bg-${getStatusColor(candidatura.Stato)} fs-6 mb-2`}>
                  {candidatura.Stato || 'In attesa'}
                </span>
                {candidatura.data_colloquio && (
                  <div className="mt-2">
                    <button 
                      className="btn btn-sm w-100"
                      style={{background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white', border: 'none'}}
                      onClick={() => handleViewColloquio(candidatura)}
                    >
                      <i className="bi bi-calendar-event me-1"></i>
                      Visualizza Colloquio
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    ) : (
      <div className="text-center py-5">
        <i className="bi bi-briefcase display-1 text-muted"></i>
        <h4 className="mt-3 text-muted">Nessuna candidatura trovata</h4>
        <p className="text-muted">Non hai ancora inviato candidature</p>
      </div>
    )}
  </div>
);

const renderOfferte = () => (
  <div className="offerte-section">
    <h2><i className="bi bi-search me-2"></i>Offerte Compatibili</h2>
    {offerteCompatibili && offerteCompatibili.length > 0 ? (
      <div className="row">
        {offerteCompatibili.map((offerta) => (
          <div key={`offerta-detail-${offerta.id || Math.random()}`} className="col-md-6 col-lg-4 mb-4">
            <div className="card h-100">
              <div className="card-body">
                <h5 className="card-title">{offerta.tipo_contratto}</h5>
                <p className="card-text">
                  <strong>Provincia:</strong> {offerta.Provincia}<br/>
                  <strong>Stipendio:</strong> €{offerta.stipendio || 'N/A'}<br/>
                  <strong>Benefit:</strong> {offerta.benefit || 'N/A'}<br />
                  <strong>Azienda:</strong> {offerta.azienda || 'N/A'}
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
        <h4 className="mt-3 text-muted">Nessuna offerta compatibile</h4>
        <p className="text-muted">Non ci sono offerte che corrispondono al tuo profilo</p>
      </div>
    )}
  </div>
);
 const renderProfilo = () => (
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
const renderFormazione = () => (
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
// Aggiungi questa funzione dopo le altre funzioni helper (prima di renderContent)
const handleViewColloquio = (candidatura) => {
  const dataColloquio = new Date(candidatura.data_colloquio).toLocaleString('it-IT');
  const infoColloquio = candidatura.info_colloquio || 'Nessuna informazione aggiuntiva';
  
  alert(`COLLOQUIO PROGRAMMATO\n\nData e ora: ${dataColloquio}\n\nInformazioni:\n${infoColloquio}`);
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
    case 'notifiche':
      return renderNotifiche();
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
              {activeSection === 'notifiche' && 'Notifiche'}
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