import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import '../styles/DashboardAzienda.css';
import logo from '../assets/logo.png';

const DashboardAzienda = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Dati utente dal login
  const [userData] = useState(() => {
    const urlParams = new URLSearchParams(location.search);
    const sessionData = JSON.parse(sessionStorage.getItem('userAzienda') || '{}');
    
    console.log('URL Params:', Object.fromEntries(urlParams));
    console.log('Session Data:', sessionData);
    
    const result = {
      id: parseInt(urlParams.get('userId')) || sessionData.id || 1,
      nome: urlParams.get('nome') ? decodeURIComponent(urlParams.get('nome')) : sessionData.nome || 'Admin',
      cognome: urlParams.get('cognome') ? decodeURIComponent(urlParams.get('cognome')) : sessionData.cognome || 'User',
      ruolo: urlParams.get('ruolo') ? decodeURIComponent(urlParams.get('ruolo')) : sessionData.ruolo || 'AMMINISTRATORE',
      aziendaId: parseInt(urlParams.get('aziendaId')) || sessionData.aziendaId || sessionData.azienda?.id || 1,
      aziendaNome: urlParams.get('aziendaNome') ? decodeURIComponent(urlParams.get('aziendaNome')) : sessionData.azienda?.nome || sessionData.aziendaNome || 'Azienda SpA'
    };
    
    console.log('UserData finale:', result);
    return result;
  });

  const [activeSection, setActiveSection] = useState('dashboard');
  const [aziendaData, setAziendaData] = useState(null);
  const [candidature, setCandidature] = useState([]);
  const [offerte, setOfferte] = useState([]);
  const [utentiAziendali, setUtentiAziendali] = useState([]);
  const [classificaCandidati, setClassificaCandidati] = useState(null);
  const [dettaglioCandidato, setDettaglioCandidato] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formazione, setFormazione] = useState({ diplomi: [], lauree: [], attestati: [] });
  const [colloquioForm, setColloquioForm] = useState({ show: false, candidaturaId: null });
  const [colloqui, setColloqui] = useState([]);
  const [filtroColloqui, setFiltroColloqui] = useState({ offertaId: '', dataInizio: '', dataFine: '' });
  const [valutazioneForm, setValutazioneForm] = useState({ show: false, candidaturaId: null, tipo: null });
  const [showSettings, setShowSettings] = useState(false);

  // Permessi basati sul ruolo
  const isReferente = userData.ruolo === 'REFERENTE';
  const isAmministratore = userData.ruolo === 'AMMINISTRATORE';
  const isOrdinario = userData.ruolo === 'ORDINARIO';
  
  const canCreateOfferte = isAmministratore || isReferente;
  const canManageUsers = isReferente;
  const canEvaluate = isAmministratore || isReferente;

  useEffect(() => {
    loadDashboardData();
    loadFormazione();
  }, []);

  const loadFormazione = async () => {
    try {
      const response = await fetch('http://localhost:1337/api/formazione');
      const data = await response.json();
      setFormazione({
        diplomi: data.diplomi || [],
        lauree: data.lauree || [],
        attestati: data.attestati || []
      });
    } catch (error) {
      console.error('Errore caricamento formazione:', error);
    }
  };

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      console.log('Caricamento dati per azienda ID:', userData.aziendaId);
      const response = await fetch(`http://localhost:1337/api/ottieni-azienda/${userData.aziendaId}`);
      const data = await response.json();
      console.log('Risposta API azienda:', data);
      
      if (data.azienda) {
        setAziendaData(data.azienda);
        setOfferte(data.azienda.offertas || []);
        setUtentiAziendali(data.azienda.utenti_aziendali || []);
        
        // Estrai candidature da tutte le offerte con dettagli completi
        const tutteCandidature = [];
        for (const offerta of data.azienda.offertas || []) {
          // Ottieni i dettagli completi dell'offerta
          let dettagliOfferta;
          try {
            const responseDettagli = await fetch(`http://localhost:1337/api/offerta/${offerta.id}/dettagli`);
            if (responseDettagli.ok) {
              dettagliOfferta = await responseDettagli.json();
            }
          } catch (error) {
            console.error(`Errore nel recupero dettagli offerta ${offerta.id}:`, error);
          }
          
          offerta.candidaturas?.forEach(candidatura => {
            tutteCandidature.push({
              id: candidatura.id,
              candidato: `${candidatura.utente_candidato?.Nome || 'N/A'} ${candidatura.utente_candidato?.Cognome || ''}`.trim(),
              offerta: dettagliOfferta?.info || offerta.info || offerta.tipo_contratto || 'N/A',
              stato: candidatura.Stato || 'in_attesa',
              data: candidatura.data_candidatura?.split('T')[0] || new Date().toISOString().split('T')[0],
              offertaId: offerta.id,
              candidatoId: candidatura.utente_candidato?.id,
              data_colloquio: candidatura.data_colloquio,
              info_colloquio: candidatura.info_colloquio
            });
          });
        }
        setCandidature(tutteCandidature);
      }
    } catch (error) {
      console.error('Errore caricamento dati:', error);
      alert('Errore nel caricamento dei dati');
    } finally {
      setLoading(false);
    }
  };

  const classificaCandidatiOfferta = async (offertaId) => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:1337/api/classifica-candidati/${offertaId}`);
      const data = await response.json();
      setClassificaCandidati(data);
      setActiveSection('classifica');
    } catch (error) {
      console.error('Errore classifica candidati:', error);
      alert('Errore nel recupero della classifica');
    } finally {
      setLoading(false);
    }
  };

  const visualizzaCandidato = async (candidatoId) => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:1337/api/ottieni-candidato/${candidatoId}`);
      const data = await response.json();
      setDettaglioCandidato(data.candidato);
      setActiveSection('dettaglio-candidato');
    } catch (error) {
      console.error('Errore recupero candidato:', error);
      alert('Errore nel recupero del candidato');
    } finally {
      setLoading(false);
    }
  };

  const valutaCandidatura = async (candidaturaId, valutazione) => {
    if (isOrdinario) {
      alert('Non hai i permessi per valutare candidature');
      return;
    }

    try {
      const response = await fetch('http://localhost:1337/api/crea-valutazione', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          candidatura: candidaturaId,
          utente_aziendale: userData.id,
          valutazione_tecnica: valutazione.tecnica || 7,
          valutazione_soft: valutazione.soft || 7,
          motivazione: valutazione.motivazione,
          note_private: valutazione.note || '',
          nuovo_stato: valutazione.stato,
          data_valutazione: new Date().toISOString()
        })
      });

      if (response.ok) {
        alert('Valutazione creata con successo');
        loadDashboardData();
      } else {
        throw new Error('Errore nella valutazione');
      }
    } catch (error) {
      console.error('Errore valutazione:', error);
      alert('Errore nella valutazione');
    }
  };

  const fissaColloquio = async (candidaturaId, colloquioData) => {
    if (isOrdinario) {
      alert('Non hai i permessi per fissare colloqui');
      return;
    }

    try {
      const response = await fetch('http://localhost:1337/api/fissa-colloquio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          candidaturaId,
          utenteAziendaleId: userData.id,
          data_colloquio: colloquioData.data,
          info_colloquio: colloquioData.info
        })
      });

      if (response.ok) {
        alert('Colloquio fissato con successo');
        loadDashboardData();
      } else {
        throw new Error('Errore nel fissare il colloquio');
      }
    } catch (error) {
      console.error('Errore colloquio:', error);
      alert('Errore nel fissare il colloquio');
    }
  };

  const creaOfferta = async (offertaData) => {
    if (!canCreateOfferte) {
      alert('Non hai i permessi per creare offerte');
      return;
    }

    try {
      const response = await fetch('http://localhost:1337/api/creazione-offerta', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          utenteAziendaleId: userData.id,
          ...offertaData
        })
      });

      if (response.ok) {
        alert('Offerta creata con successo');
        loadDashboardData();
        setActiveSection('offerte');
      } else {
        throw new Error('Errore nella creazione offerta');
      }
    } catch (error) {
      console.error('Errore creazione offerta:', error);
      alert('Errore nella creazione offerta');
    }
  };

  const creaUtenteAziendale = async (datiUtente) => {
    if (!isReferente) {
      alert('Solo i referenti possono creare utenti');
      return;
    }

    try {
      const response = await fetch('http://localhost:1337/api/creazione-utente', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...datiUtente,
          aziendaId: userData.aziendaId
        })
      });

      if (response.ok) {
        const result = await response.json();
        alert(`Utente creato con successo. Password: ${result.passwordGenerata}`);
        loadDashboardData();
      } else {
        throw new Error('Errore nella creazione utente');
      }
    } catch (error) {
      console.error('Errore creazione utente:', error);
      alert('Errore nella creazione utente');
    }
  };

  const gestisciUtente = async (utenteId, azione, nuovoRuolo = null) => {
    if (!isReferente) {
      alert('Solo i referenti possono gestire utenti');
      return;
    }

    try {
      const response = await fetch('http://localhost:1337/api/gestisci-aziendale', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          azione,
          utenteId,
          nuovoRuolo
        })
      });

      if (response.ok) {
        alert('Operazione completata con successo');
        loadDashboardData();
      } else {
        throw new Error('Errore nella gestione utente');
      }
    } catch (error) {
      console.error('Errore gestione utente:', error);
      alert('Errore nella gestione utente');
    }
  };

  const loadColloqui = async () => {
    try {
      const params = new URLSearchParams();
      if (filtroColloqui.offertaId) params.append('offertaId', filtroColloqui.offertaId);
      if (filtroColloqui.dataInizio) params.append('dataInizio', filtroColloqui.dataInizio);
      if (filtroColloqui.dataFine) params.append('dataFine', filtroColloqui.dataFine);
      
      const response = await fetch(`http://localhost:1337/api/ottieni-colloqui/${userData.aziendaId}?${params}`);
      const data = await response.json();
      setColloqui(data.colloqui || []);
    } catch (error) {
      console.error('Errore caricamento colloqui:', error);
      alert('Errore nel caricamento dei colloqui');
    }
  };

  const renderImpostazioni = () => (
    <div className="section-card">
      <h2>Impostazioni Account</h2>
      <div className="card">
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
                  email: userData.email || `${userData.nome.toLowerCase()}.${userData.cognome.toLowerCase()}@azienda.com`,
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
            <button type="submit" className="view-all-btn" style={{maxWidth: '200px'}}>
              <i className="bi bi-shield-check me-2"></i>Cambia Password
            </button>
          </form>
        </div>
      </div>
    </div>
  );

  const renderNavigation = () => (
    <div className="sidebar-nav" style={{overflowY: 'auto', maxHeight: 'calc(100vh - 200px)'}}>
      <button
        className={`nav-item ${activeSection === 'impostazioni' ? 'active' : ''}`}
        onClick={() => setActiveSection('impostazioni')}
        style={{marginBottom: '0.5rem', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', padding: '0.5rem 1rem', fontSize: '0.9rem'}}
      >
        <i className="bi bi-gear"></i>
        Impostazioni
      </button>
      
      <button
        className={`nav-item ${activeSection === 'dashboard' ? 'active' : ''}`}
        onClick={() => setActiveSection('dashboard')}
        style={{padding: '0.5rem 1rem', fontSize: '0.9rem'}}
      >
        <i className="bi bi-speedometer2"></i>
        Dashboard
      </button>

      <button
        className={`nav-item ${activeSection === 'candidature' ? 'active' : ''}`}
        onClick={() => setActiveSection('candidature')}
        style={{padding: '0.5rem 1rem', fontSize: '0.9rem'}}
      >
        <i className="bi bi-people-fill"></i>
        Candidature
        {candidature.filter(c => c.stato === 'in_attesa').length > 0 && (
          <span className="badge ms-2">{candidature.filter(c => c.stato === 'in_attesa').length}</span>
        )}
      </button>

      <button
        className={`nav-item ${activeSection === 'offerte' ? 'active' : ''}`}
        onClick={() => setActiveSection('offerte')}
        style={{padding: '0.5rem 1rem', fontSize: '0.9rem'}}
      >
        <i className="bi bi-briefcase-fill"></i>
        Offerte
      </button>

      {canCreateOfferte && (
        <button
          className={`nav-item ${activeSection === 'crea-offerta' ? 'active' : ''}`}
          onClick={() => setActiveSection('crea-offerta')}
          style={{padding: '0.5rem 1rem', fontSize: '0.9rem'}}
        >
          <i className="bi bi-plus-circle-fill"></i>
          Crea Offerta
        </button>
      )}

      {canEvaluate && (
        <button
          className={`nav-item ${activeSection === 'colloqui' ? 'active' : ''}`}
          onClick={() => {
            setActiveSection('colloqui');
            loadColloqui();
          }}
          style={{padding: '0.5rem 1rem', fontSize: '0.9rem'}}
        >
          <i className="bi bi-calendar-event"></i>
          Colloqui
        </button>
      )}

      {isReferente && (
        <>
          <button
            className={`nav-item ${activeSection === 'gestisci-utenti' ? 'active' : ''}`}
            onClick={() => setActiveSection('gestisci-utenti')}
            style={{padding: '0.5rem 1rem', fontSize: '0.9rem'}}
          >
            <i className="bi bi-person-gear"></i>
            Utenti
          </button>

          <button
            className={`nav-item ${activeSection === 'crea-utente' ? 'active' : ''}`}
            onClick={() => setActiveSection('crea-utente')}
            style={{padding: '0.5rem 1rem', fontSize: '0.9rem'}}
          >
            <i className="bi bi-person-plus"></i>
            Nuovo Utente
          </button>

          <button
            className={`nav-item ${activeSection === 'profilo-azienda' ? 'active' : ''}`}
            onClick={() => setActiveSection('profilo-azienda')}
            style={{padding: '0.5rem 1rem', fontSize: '0.9rem'}}
          >
            <i className="bi bi-building-gear"></i>
            Profilo
          </button>
        </>
      )}
    </div>
  );

  const renderDashboard = () => (
    <div className="dashboard-overview">
      
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon company-bg">
            <i className="bi bi-people-fill"></i>
          </div>
          <div className="stat-content">
            <h3>{candidature.length}</h3>
            <p>Candidature Totali</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon success-bg">
            <i className="bi bi-check-circle-fill"></i>
          </div>
          <div className="stat-content">
            <h3>{candidature.filter(c => c.stato === 'accettata').length}</h3>
            <p>Candidature Accettate</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon warning-bg">
            <i className="bi bi-clock-fill"></i>
          </div>
          <div className="stat-content">
            <h3>{candidature.filter(c => c.stato === 'in_attesa').length}</h3>
            <p>In Attesa</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon info-bg">
            <i className="bi bi-briefcase-fill"></i>
          </div>
          <div className="stat-content">
            <h3>{offerte.length}</h3>
            <p>Offerte Attive</p>
          </div>
        </div>
      </div>

      <div className="quick-sections">
        <div className="section-card">
          <h3>Candidature Recenti</h3>
          <div className="quick-list">
            {candidature.slice(0, 5).map(candidatura => (
              <div key={candidatura.id} className="quick-item">
                <div>
                  <div className="item-title">{candidatura.candidato}</div>
                  <div className="item-subtitle">{candidatura.offerta}</div>
                </div>
                <span className={`status ${candidatura.stato}`}>
                  {candidatura.stato.replace('_', ' ')}
                </span>
              </div>
            ))}
          </div>
          <button className="view-all-btn" onClick={() => setActiveSection('candidature')}>
            Vedi Tutte
          </button>
        </div>

        <div className="section-card">
          <h3>Offerte di Lavoro</h3>
          <div className="quick-list">
            {offerte.slice(0, 5).map(offerta => (
              <div key={offerta.id} className="quick-item">
                <div>
                  <div className="item-title">{offerta.info}</div>
                  <div className="item-subtitle">{offerta.Provincia} - €{offerta.stipendio}</div>
                </div>
                <button 
                  className="btn btn-sm btn-outline-primary"
                  onClick={() => classificaCandidatiOfferta(offerta.id)}
                >
                  <i className="bi bi-bar-chart-fill me-1"></i> Classifica
                </button>
              </div>
            ))}
          </div>
          <button className="view-all-btn" onClick={() => setActiveSection('offerte')}>
            Vedi Tutte
          </button>
        </div>
      </div>
    </div>
  );

  const renderCandidature = () => (
    <div className="candidature-section">
      <h2>Gestione Candidature</h2>
      <div className="table-responsive">
        <table className="table table-hover">
          <thead>
            <tr>
              <th>Candidato</th>
              <th>Offerta</th>
              <th>Data</th>
              <th>Stato</th>
              <th>Azioni</th>
            </tr>
          </thead>
          <tbody>
            {candidature.map(candidatura => (
              <tr key={candidatura.id}>
                <td>{candidatura.candidato}</td>
                <td>
                  <button 
                    className="btn btn-link p-0 text-decoration-none d-flex align-items-center"
                    style={{color: '#667eea', fontWeight: 'bold'}}
                    onClick={() => classificaCandidatiOfferta(candidatura.offertaId)}
                  >
                    <i className="bi bi-bar-chart me-2" style={{fontSize: '0.9rem'}}></i>
                    {candidatura.offerta}
                    <i className="bi bi-box-arrow-up-right ms-2" style={{fontSize: '0.8rem'}}></i>
                  </button>
                </td>
                <td>{new Date(candidatura.data).toLocaleDateString()}</td>
                <td>
                  <span className={`status ${candidatura.stato}`}>
                    {candidatura.stato.replace('_', ' ')}
                  </span>
                </td>
                <td>
                  <div className="btn-group btn-group-sm">
                    <button 
                      className="btn btn-outline-info"
                      onClick={() => visualizzaCandidato(candidatura.candidatoId)}
                    >
                      <i className="bi bi-eye"></i>
                    </button>
                    {!isOrdinario && (
                      <>
                        <button 
                          className="btn btn-outline-success"
                          onClick={() => setColloquioForm({ show: true, candidaturaId: candidatura.id })}
                          title="Fissa Colloquio"
                        >
                          <i className="bi bi-calendar-plus"></i>
                        </button>
                        <button 
                          className="btn btn-outline-success"
                          onClick={() => setValutazioneForm({ show: true, candidaturaId: candidatura.id, tipo: 'accettata' })}
                        >
                          <i className="bi bi-check-circle"></i>
                        </button>
                        <button 
                          className="btn btn-outline-danger"
                          onClick={() => setValutazioneForm({ show: true, candidaturaId: candidatura.id, tipo: 'rifiutata' })}
                        >
                          <i className="bi bi-x-circle"></i>
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderOfferte = () => (
    <div className="offerte-section">
      <h2>Offerte di Lavoro</h2>
      <div className="row">
        {offerte.map(offerta => (
          <div key={offerta.id} className="col-md-6 col-lg-4 mb-4">
            <div className="card">
              <div className="card-body">
                <h5 className="card-title">{offerta.info}</h5>
                <p className="card-text">
                  <strong>Contratto:</strong> {offerta.tipo_contratto}<br/>
                  <strong>Provincia:</strong> {offerta.Provincia}<br/>
                  <strong>Stipendio:</strong> €{offerta.stipendio}
                </p>
                <button 
                  className="view-all-btn"
                  onClick={() => classificaCandidatiOfferta(offerta.id)}
                >
                  Visualizza Classifica Candidati
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderCreaOfferta = () => {
    if (!canCreateOfferte) {
      return (
        <div className="alert alert-warning">
          Non hai i permessi per creare offerte.
        </div>
      );
    }

    return (
      <div className="section-card">
        <h2 className="mb-4">Crea Nuova Offerta</h2>
        <form onSubmit={(e) => {
          e.preventDefault();
          const formData = new FormData(e.target);
          
          // Raccogli diplomi selezionati
          const diplomaIds = [];
          const diplomaCheckboxes = e.target.querySelectorAll('input[name="diplomas"]:checked');
          diplomaCheckboxes.forEach(cb => diplomaIds.push(parseInt(cb.value)));
          
          // Raccogli lauree selezionate
          const laureaIds = [];
          const laureaCheckboxes = e.target.querySelectorAll('input[name="lauree"]:checked');
          laureaCheckboxes.forEach(cb => laureaIds.push(parseInt(cb.value)));
          
          // Raccogli attestati selezionati
          const attestatoIds = [];
          const attestatoCheckboxes = e.target.querySelectorAll('input[name="attestati"]:checked');
          attestatoCheckboxes.forEach(cb => attestatoIds.push(parseInt(cb.value)));
          
          const offertaData = {
            tipo_contratto: formData.get('tipo_contratto'),
            info: formData.get('info'),
            benefit: formData.get('benefit'),
            Provincia: formData.get('provincia'),
            stipendio: parseInt(formData.get('stipendio')) || 0,
            diplomaIds,
            laureaIds,
            attestatoIds
          };
          creaOfferta(offertaData);
        }}>
          <div className="form-card p-4 mb-4">
            <h4 className="mb-3">Informazioni Generali</h4>
            
            <div className="row">
              <div className="col-md-6">
                <div className="mb-4">
                  <label className="form-label">Tipo Contratto</label>
                  <select name="tipo_contratto" className="form-select" required>
                    <option value="">Seleziona tipo</option>
                    <option value="Tempo Indeterminato">Tempo Indeterminato</option>
                    <option value="Tempo Determinato">Tempo Determinato</option>
                    <option value="Stage">Stage</option>
                    <option value="Freelance">Freelance</option>
                  </select>
                </div>
              </div>
              <div className="col-md-6">
                <div className="mb-4">
                  <label className="form-label">Provincia</label>
                  <input type="text" name="provincia" className="form-control" required />
                </div>
              </div>
            </div>
            
            <div className="mb-4">
              <label className="form-label">Descrizione Posizione</label>
              <textarea name="info" className="form-control" rows="4" required></textarea>
            </div>
            
            <div className="mb-4">
              <label className="form-label">Benefit</label>
              <textarea name="benefit" className="form-control" rows="3"></textarea>
            </div>
            
            <div className="mb-3">
              <label className="form-label">Stipendio (€)</label>
              <input type="number" name="stipendio" className="form-control" />
            </div>
          </div>
          
          <h4 className="mt-4 mb-3">Requisiti di Formazione</h4>
          
          <div className="requisiti-container">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="mb-0">Diplomi Richiesti</h5>
            </div>
            <div className="form-check-container p-3 mb-4" style={{background: 'white', borderRadius: '10px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)'}}>
              {formazione.diplomi.map(diploma => (
                <div key={diploma.id} className="form-check mb-2">
                  <input className="form-check-input" type="checkbox" name="diplomas" value={diploma.id} id={`diploma-${diploma.id}`} />
                  <label className="form-check-label" htmlFor={`diploma-${diploma.id}`}>{diploma.nome}</label>
                </div>
              ))}
            </div>
            
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="mb-0">Lauree Richieste</h5>
            </div>
            <div className="form-check-container p-3 mb-4" style={{background: 'white', borderRadius: '10px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)'}}>
              {formazione.lauree.map(laurea => (
                <div key={laurea.id} className="form-check mb-2">
                  <input className="form-check-input" type="checkbox" name="lauree" value={laurea.id} id={`laurea-${laurea.id}`} />
                  <label className="form-check-label" htmlFor={`laurea-${laurea.id}`}>{laurea.nome}</label>
                </div>
              ))}
            </div>
            
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="mb-0">Attestati Richiesti</h5>
            </div>
            <div className="form-check-container p-3" style={{background: 'white', borderRadius: '10px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)'}}>
              {formazione.attestati.map(attestato => (
                <div key={attestato.id} className="form-check mb-2">
                  <input className="form-check-input" type="checkbox" name="attestati" value={attestato.id} id={`attestato-${attestato.id}`} />
                  <label className="form-check-label" htmlFor={`attestato-${attestato.id}`}>{attestato.nome}</label>
                </div>
              ))}
            </div>
          </div>
          
          <div className="text-center mt-4">
            <button type="submit" className="view-all-btn" style={{maxWidth: '300px'}}>
              <i className="bi bi-plus-circle me-2"></i> Crea Offerta
            </button>
          </div>
        </form>
      </div>
    );
  };

  const renderCreaUtente = () => {
    if (!isReferente) {
      return (
        <div className="alert alert-warning">
          Solo i referenti possono creare utenti.
        </div>
      );
    }

    return (
      <div className="section-card">
        <h2>Crea Nuovo Utente Aziendale</h2>
        <form onSubmit={(e) => {
          e.preventDefault();
          const formData = new FormData(e.target);
          const datiUtente = {
            Nome: formData.get('nome'),
            Cognome: formData.get('cognome'),
            Email: formData.get('email'),
            Ruolo: formData.get('ruolo'),
            Provincia: formData.get('provincia'),
            Citta: formData.get('citta'),
            Nazione: formData.get('nazione')
          };
          creaUtenteAziendale(datiUtente);
        }}>
          <div className="form-card p-4 mb-4">
            <h4 className="mb-3">Dati Personali</h4>
            
            <div className="row">
              <div className="col-md-6">
                <div className="mb-4">
                  <label className="form-label">Nome</label>
                  <input type="text" name="nome" className="form-control" required />
                </div>
              </div>
              <div className="col-md-6">
                <div className="mb-4">
                  <label className="form-label">Cognome</label>
                  <input type="text" name="cognome" className="form-control" required />
                </div>
              </div>
            </div>
            
            <div className="mb-4">
              <label className="form-label">Email</label>
              <input type="email" name="email" className="form-control" required />
            </div>
            
            <div className="mb-4">
              <label className="form-label">Ruolo</label>
              <select name="ruolo" className="form-select" required>
                <option value="">Seleziona ruolo</option>
                <option value="AMMINISTRATORE">Amministratore</option>
                <option value="ORDINARIO">Ordinario</option>
              </select>
            </div>
          </div>
          
          <div className="form-card p-4 mb-4">
            <h4 className="mb-3">Informazioni di Residenza</h4>
            
            <div className="row">
              <div className="col-md-4">
                <div className="mb-4">
                  <label className="form-label">Provincia</label>
                  <input type="text" name="provincia" className="form-control" />
                </div>
              </div>
              <div className="col-md-4">
                <div className="mb-4">
                  <label className="form-label">Città</label>
                  <input type="text" name="citta" className="form-control" />
                </div>
              </div>
              <div className="col-md-4">
                <div className="mb-4">
                  <label className="form-label">Nazione</label>
                  <input type="text" name="nazione" className="form-control" />
                </div>
              </div>
            </div>
          </div>
          
          <div className="text-center mt-4">
            <button type="submit" className="view-all-btn" style={{maxWidth: '300px'}}>
              <i className="bi bi-person-plus me-2"></i> Crea Utente
            </button>
          </div>
        </form>
      </div>
    );
  };

  const renderGestisciUtenti = () => {
    if (!isReferente) {
      return (
        <div className="alert alert-warning">
          Solo i referenti possono gestire utenti.
        </div>
      );
    }

    return (
      <div className="section-card">
        <h2>Gestione Utenti Aziendali</h2>
        <div className="table-responsive">
          <table className="table table-hover">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Email</th>
                <th>Ruolo</th>
                <th>Azioni</th>
              </tr>
            </thead>
            <tbody>
              {utentiAziendali.map(utente => (
                <tr key={utente.id}>
                  <td>{utente.Nome} {utente.Cognome}</td>
                  <td>{utente.Email}</td>
                  <td>{utente.Ruolo}</td>
                  <td>
                    {utente.Ruolo !== 'REFERENTE' ? (
                      <div className="d-flex gap-2 align-items-center">
                        <div className="d-flex align-items-center gap-1">
                          <i className="bi bi-person-gear text-primary"></i>
                          <select 
                            className="form-select form-select-sm"
                            value={utente.Ruolo}
                            onChange={(e) => {
                              if (e.target.value !== utente.Ruolo) {
                                gestisciUtente(utente.id, 'modifica_ruolo', e.target.value);
                              }
                            }}
                          >
                            <option value="AMMINISTRATORE">Amministratore</option>
                            <option value="ORDINARIO">Ordinario</option>
                          </select>
                        </div>
                        <button 
                          className="btn btn-outline-danger btn-sm"
                          onClick={() => {
                            if (window.confirm('Sei sicuro di voler eliminare questo utente?')) {
                              gestisciUtente(utente.id, 'elimina');
                            }
                          }}
                        >
                          <i className="bi bi-trash"></i>
                        </button>
                      </div>
                    ) : (
                      <span className="text-muted">Non modificabile</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const aggiornaProfiloAzienda = async (datiProfilo) => {
    if (!isReferente) {
      alert('Solo i referenti possono modificare il profilo aziendale');
      return;
    }

    try {
      const response = await fetch(`http://localhost:1337/api/profilo-aziendale/${userData.aziendaId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datiProfilo)
      });

      if (response.ok) {
        alert('Profilo aziendale aggiornato con successo');
        loadDashboardData();
      } else {
        throw new Error('Errore nell\'aggiornamento del profilo');
      }
    } catch (error) {
      console.error('Errore aggiornamento profilo:', error);
      alert('Errore nell\'aggiornamento del profilo');
    }
  };

  const renderProfiloAzienda = () => {
    if (!isReferente) {
      return (
        <div className="alert alert-warning">
          Solo i referenti possono modificare il profilo aziendale.
        </div>
      );
    }

    return (
      <div className="section-card">
        <h2>Profilo Azienda</h2>
        {aziendaData && (
          <form onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const datiProfilo = {
              Descrizione: formData.get('descrizione'),
              email_contatto: formData.get('email'),
              valori_aziendali: formData.get('valori_aziendali'),
              numero_dipendenti: parseInt(formData.get('numero_dipendenti')) || 0
            };
            aggiornaProfiloAzienda(datiProfilo);
          }}>
            <div className="form-card p-4 mb-4">
              <h4 className="mb-3">Informazioni Aziendali</h4>
              
              <div className="mb-4">
                <label className="form-label">Descrizione</label>
                <textarea 
                  name="descrizione"
                  className="form-control" 
                  rows="4"
                  defaultValue={aziendaData.Descrizione || ''}
                  placeholder="Descrivi la tua azienda..."
                />
              </div>

              <div className="mb-4">
                <label className="form-label">Email di Contatto</label>
                <input 
                  type="email" 
                  name="email"
                  className="form-control" 
                  defaultValue={aziendaData.email_contatto || ''}
                  placeholder="contatti@azienda.com"
                />
              </div>
              
              <div className="mb-4">
                <label className="form-label">Numero Dipendenti</label>
                <input 
                  type="number" 
                  name="numero_dipendenti"
                  className="form-control" 
                  defaultValue={aziendaData.numero_dipendenti || ''}
                  placeholder="Es. 50"
                  min="1"
                />
              </div>
              
              <div className="mb-3">
                <label className="form-label">Valori Aziendali</label>
                <textarea 
                  name="valori_aziendali"
                  className="form-control" 
                  rows="4"
                  defaultValue={aziendaData.valori_aziendali || ''}
                  placeholder="Descrivi i valori e la mission della tua azienda..."
                />
              </div>
            </div>
            <div className="text-center mt-4">
              <button type="submit" className="view-all-btn" style={{maxWidth: '300px'}}>
                <i className="bi bi-check-circle me-2"></i> Salva Modifiche
              </button>
            </div>
          </form>
        )}
      </div>
    );
  };

  const renderClassifica = () => {
    if (!classificaCandidati) return null;

    return (
      <div className="section-card">
        <h2>Classifica Candidati</h2>
        <div className="mb-3">
          <strong>Totale candidati:</strong> {classificaCandidati.totale_candidati}
        </div>
        
        <div className="table-responsive">
          <table className="table table-striped">
            <thead>
              <tr>
                <th>Posizione</th>
                <th>Nome</th>
                <th>Email</th>
                <th>Punteggio</th>
                <th>Stato</th>
                <th>Azioni</th>
              </tr>
            </thead>
            <tbody>
              {classificaCandidati.classifica?.map(candidato => (
                <tr key={candidato.candidato_id}>
                  <td>
                    <strong>#{candidato.posizione}</strong>
                  </td>
                  <td>{candidato.nome} {candidato.cognome}</td>
                  <td>{candidato.email}</td>
                  <td>
                    <span className="badge bg-primary">
                      {candidato.punteggio_totale}
                    </span>
                  </td>
                  <td>
                    <span className={`status ${candidato.stato_candidatura}`}>
                      {candidato.stato_candidatura}
                    </span>
                  </td>
                  <td>
                    <div className="btn-group btn-group-sm">
                      <button 
                        className="btn btn-outline-info"
                        onClick={() => visualizzaCandidato(candidato.candidato_id)}
                      >
                        <i className="bi bi-eye"></i>
                      </button>
                      {!isOrdinario && (
                        <>
                          <button 
                            className="btn btn-outline-success"
                            onClick={() => {
                              const candidaturaId = candidature.find(c => c.candidatoId === candidato.candidato_id)?.id;
                              if (candidaturaId) {
                                setColloquioForm({ show: true, candidaturaId });
                              }
                            }}
                            title="Fissa Colloquio"
                          >
                            <i className="bi bi-calendar-plus"></i>
                          </button>
                          <button 
                            className="btn btn-outline-success"
                            onClick={() => {
                              const candidaturaId = candidature.find(c => c.candidatoId === candidato.candidato_id)?.id;
                              if (candidaturaId) {
                                setValutazioneForm({ show: true, candidaturaId, tipo: 'accettata' });
                              }
                            }}
                          >
                            <i className="bi bi-check-circle"></i>
                          </button>
                          <button 
                            className="btn btn-outline-danger"
                            onClick={() => {
                              const candidaturaId = candidature.find(c => c.candidatoId === candidato.candidato_id)?.id;
                              if (candidaturaId) {
                                setValutazioneForm({ show: true, candidaturaId, tipo: 'rifiutata' });
                              }
                            }}
                          >
                            <i className="bi bi-x-circle"></i>
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="text-center mt-4">
          <button 
            className="view-all-btn" 
            style={{maxWidth: '300px'}}
            onClick={() => setActiveSection('dashboard')}
          >
            <i className="bi bi-arrow-left me-2"></i> Torna alla Dashboard
          </button>
        </div>
      </div>
    );
  };

  const renderFissaColloquio = () => {
    if (!colloquioForm.show) return null;

    const candidaturaCorrente = candidature.find(c => c.id === colloquioForm.candidaturaId);
    const colloquioEsistente = candidaturaCorrente?.data_colloquio;

    return (
      <div className="section-card">
        <h2 className="mb-4">Fissa Colloquio</h2>
        
        {colloquioEsistente && (
          <div className="alert alert-info mb-4">
            <h5><i className="bi bi-info-circle me-2"></i>Colloquio già programmato</h5>
            <p className="mb-1"><strong>Data e ora:</strong> {new Date(colloquioEsistente).toLocaleString()}</p>
            {candidaturaCorrente?.info_colloquio && (
              <p className="mb-0"><strong>Info:</strong> {candidaturaCorrente.info_colloquio}</p>
            )}
          </div>
        )}
        
        <form onSubmit={(e) => {
          e.preventDefault();
          const formData = new FormData(e.target);
          const colloquioData = {
            data: formData.get('data_colloquio'),
            info: formData.get('info_colloquio')
          };
          fissaColloquio(colloquioForm.candidaturaId, colloquioData);
          setColloquioForm({ show: false, candidaturaId: null });
        }}>
          <div className="form-card p-4 mb-4">
            <h4 className="mb-3">{colloquioEsistente ? 'Modifica Colloquio' : 'Dettagli Colloquio'}</h4>
            
            <div className="mb-4">
              <label className="form-label">Data e Ora Colloquio</label>
              <input 
                type="datetime-local" 
                name="data_colloquio" 
                className="form-control" 
                required 
              />
            </div>
            
            <div className="mb-3">
              <label className="form-label">Informazioni Colloquio</label>
              <textarea 
                name="info_colloquio" 
                className="form-control" 
                rows="4" 
                placeholder="Inserisci dettagli sul colloquio (luogo, modalità, cosa portare, ecc.)" 
                required
              ></textarea>
            </div>
          </div>
          
          <div className="text-center">
            <button type="submit" className="view-all-btn me-3" style={{maxWidth: '200px'}}>
              <i className="bi bi-calendar-check me-2"></i> {colloquioEsistente ? 'Aggiorna Colloquio' : 'Fissa Colloquio'}
            </button>
            <button 
              type="button" 
              className="btn btn-outline-danger" 
              style={{maxWidth: '200px'}}
              onClick={() => setColloquioForm({ show: false, candidaturaId: null })}
            >
              <i className="bi bi-x-circle me-2"></i> Annulla
            </button>
          </div>
        </form>
      </div>
    );
  };

  const renderDettaglioCandidato = () => {
    if (!dettaglioCandidato) return null;

    return (
      <div className="section-card">
        <h2>Dettaglio Candidato</h2>
        <div className="row">
          <div className="col-md-6">
            <h4>Informazioni Personali</h4>
            <p><strong>Nome:</strong> {dettaglioCandidato.Nome}</p>
            <p><strong>Cognome:</strong> {dettaglioCandidato.Cognome}</p>
            <p><strong>Email:</strong> {dettaglioCandidato.Email}</p>
            <p><strong>Provincia:</strong> {dettaglioCandidato.Provincia}</p>
            
            {/* CV Section */}
            {dettaglioCandidato.CV && (
              <div className="mt-4">
                <h5><i className="bi bi-file-earmark-pdf me-2"></i>Curriculum Vitae</h5>
                <div className="d-flex align-items-center p-3 bg-light rounded">
                  <i className="bi bi-file-earmark-pdf fs-3 text-danger me-3"></i>
                  <div className="flex-grow-1">
                    <h6 className="mb-1">{dettaglioCandidato.CV.name || 'curriculum.pdf'}</h6>
                    <small className="text-muted">CV del candidato</small>
                  </div>
                  <div className="d-flex gap-2">
                    <a 
                      href={`http://localhost:1337${dettaglioCandidato.CV.url}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-sm btn-outline-primary"
                    >
                      <i className="bi bi-eye me-1"></i> Visualizza
                    </a>
                    <a 
                      href={`http://localhost:1337${dettaglioCandidato.CV.url}`}
                      download
                      className="btn btn-sm btn-outline-success"
                    >
                      <i className="bi bi-download me-1"></i> Scarica
                    </a>
                  </div>
                </div>
              </div>
            )}
            
            {/* Portfolio Links */}
            {(dettaglioCandidato.github || dettaglioCandidato.linkedin || dettaglioCandidato.altri_link) && (
              <div className="mt-4">
                <h5><i className="bi bi-link-45deg me-2"></i>Portfolio e Link</h5>
                <div className="p-3 bg-light rounded">
                  {dettaglioCandidato.github && (
                    <div className="mb-2">
                      <strong>GitHub:</strong>
                      <a href={dettaglioCandidato.github} target="_blank" rel="noopener noreferrer" className="ms-2">
                        <i className="bi bi-github me-1"></i>{dettaglioCandidato.github}
                      </a>
                    </div>
                  )}
                  
                  {dettaglioCandidato.linkedin && (
                    <div className="mb-2">
                      <strong>LinkedIn:</strong>
                      <a href={dettaglioCandidato.linkedin} target="_blank" rel="noopener noreferrer" className="ms-2">
                        <i className="bi bi-linkedin me-1"></i>{dettaglioCandidato.linkedin}
                      </a>
                    </div>
                  )}
                  
                  {dettaglioCandidato.altri_link && (
                    <div>
                      <strong>Altri Link:</strong>
                      <div className="mt-1">
                        {dettaglioCandidato.altri_link.split('\n').filter(link => link.trim()).map((link, index) => (
                          <div key={index}>
                            <a href={link.trim()} target="_blank" rel="noopener noreferrer">
                              <i className="bi bi-link me-1"></i>{link.trim()}
                            </a>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
          
          <div className="col-md-6">
            <h4>Titoli di Studio</h4>
            {dettaglioCandidato.ha_laureas?.map((laurea, index) => (
              <div key={index} className="mb-2">
                <strong>Laurea:</strong> {laurea.laurea?.nome || 'N/A'} 
                <span className="badge bg-success ms-2">Voto: {laurea.voto}</span>
              </div>
            ))}
            
            {dettaglioCandidato.ha_diplomas?.map((diploma, index) => (
              <div key={index} className="mb-2">
                <strong>Diploma:</strong> {diploma.diploma?.nome || 'N/A'}
                <span className="badge bg-info ms-2">Voto: {diploma.voto}</span>
              </div>
            ))}
            
            {dettaglioCandidato.ha_attestatoes?.map((attestato, index) => (
              <div key={index} className="mb-2">
                <strong>Attestato:</strong> {attestato.attestato?.nome || 'N/A'}
                <span className="badge bg-warning ms-2">{attestato.livello}</span>
              </div>
            ))}
          </div>
        </div>
        
        <div className="text-center mt-4">
          <button 
            className="view-all-btn" 
            style={{maxWidth: '300px'}}
            onClick={() => setActiveSection('candidature')}
          >
            <i className="bi bi-arrow-left me-2"></i> Torna alle Candidature
          </button>
        </div>
      </div>
    );
  };

  const renderColloqui = () => {
    if (!canEvaluate) {
      return (
        <div className="alert alert-warning">
          Non hai i permessi per visualizzare i colloqui.
        </div>
      );
    }

    return (
      <div className="colloqui-section">
        <h2>Gestione Colloqui</h2>
        
        {/* Filtri */}
        <div className="card mb-4">
          <div className="card-body">
            <h5 className="card-title">Filtri</h5>
            <div className="row">
              <div className="col-md-4">
                <label className="form-label">Offerta</label>
                <select 
                  className="form-select"
                  value={filtroColloqui.offertaId}
                  onChange={(e) => setFiltroColloqui({...filtroColloqui, offertaId: e.target.value})}
                >
                  <option value="">Tutte le offerte</option>
                  {offerte.map(offerta => (
                    <option key={offerta.id} value={offerta.id}>
                      {offerta.info || offerta.tipo_contratto}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-md-3">
                <label className="form-label">Data Inizio</label>
                <input 
                  type="date" 
                  className="form-control"
                  value={filtroColloqui.dataInizio}
                  onChange={(e) => setFiltroColloqui({...filtroColloqui, dataInizio: e.target.value})}
                />
              </div>
              <div className="col-md-3">
                <label className="form-label">Data Fine</label>
                <input 
                  type="date" 
                  className="form-control"
                  value={filtroColloqui.dataFine}
                  onChange={(e) => setFiltroColloqui({...filtroColloqui, dataFine: e.target.value})}
                />
              </div>
              <div className="col-md-2 d-flex align-items-end">
                <button 
                  className="view-all-btn w-100"
                  onClick={loadColloqui}
                >
                  <i className="bi bi-search me-1"></i> Filtra
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Tabella Colloqui */}
        <div className="table-responsive">
          <table className="table table-hover">
            <thead>
              <tr>
                <th>Data e Ora</th>
                <th>Candidato</th>
                <th>Offerta</th>
                <th>Stato</th>
                <th>Azioni</th>
              </tr>
            </thead>
            <tbody>
              {colloqui.map(colloquio => (
                <tr key={colloquio.id}>
                  <td>
                    <strong>{new Date(colloquio.data_colloquio).toLocaleDateString('it-IT')}</strong><br/>
                    <small className="text-muted">{new Date(colloquio.data_colloquio).toLocaleTimeString('it-IT', {hour: '2-digit', minute: '2-digit'})}</small>
                  </td>
                  <td>
                    {colloquio.candidato.nome} {colloquio.candidato.cognome}<br/>
                    <small className="text-muted">{colloquio.candidato.email}</small>
                  </td>
                  <td>
                    {colloquio.offerta.info || colloquio.offerta.tipo_contratto}<br/>
                    <small className="text-muted">{colloquio.offerta.provincia}</small>
                  </td>
                  <td>
                    <span className={`status ${colloquio.stato}`}>
                      {colloquio.stato.replace('_', ' ')}
                    </span>
                  </td>
                  <td>
                    <div className="btn-group btn-group-sm">
                      <button 
                        className="btn btn-outline-info"
                        onClick={() => visualizzaCandidato(colloquio.candidato.id)}
                        title="Visualizza Candidato"
                      >
                        <i className="bi bi-eye"></i>
                      </button>
                      <button 
                        className="btn btn-outline-warning"
                        onClick={() => setColloquioForm({ show: true, candidaturaId: colloquio.id })}
                        title="Modifica Colloquio"
                      >
                        <i className="bi bi-pencil"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {colloqui.length === 0 && (
            <div className="text-center py-5">
              <i className="bi bi-calendar-x display-1 text-muted"></i>
              <h4 className="mt-3 text-muted">Nessun colloquio trovato</h4>
              <p className="text-muted">Non ci sono colloqui programmati con i filtri selezionati</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderValutazione = () => {
    if (!valutazioneForm.show) return null;

    const candidaturaCorrente = candidature.find(c => c.id === valutazioneForm.candidaturaId);
    const isAccettazione = valutazioneForm.tipo === 'accettata';

    return (
      <div className="section-card">
        <h2 className="mb-4">
          <i className={`bi ${isAccettazione ? 'bi-check-circle text-success' : 'bi-x-circle text-danger'} me-2`}></i>
          {isAccettazione ? 'Accetta Candidatura' : 'Rifiuta Candidatura'}
        </h2>
        
        {candidaturaCorrente && (
          <div className="alert alert-info mb-4">
            <h5><i className="bi bi-info-circle me-2"></i>Dettagli Candidatura</h5>
            <p className="mb-1"><strong>Candidato:</strong> {candidaturaCorrente.candidato}</p>
            <p className="mb-0"><strong>Offerta:</strong> {candidaturaCorrente.offerta}</p>
          </div>
        )}
        
        <form onSubmit={(e) => {
          e.preventDefault();
          const formData = new FormData(e.target);
          const valutazioneData = {
            tecnica: parseInt(formData.get('valutazione_tecnica')) || (isAccettazione ? 8 : 5),
            soft: parseInt(formData.get('valutazione_soft')) || (isAccettazione ? 8 : 5),
            motivazione: formData.get('motivazione'),
            note: formData.get('note_private') || '',
            stato: valutazioneForm.tipo
          };
          valutaCandidatura(valutazioneForm.candidaturaId, valutazioneData);
          setValutazioneForm({ show: false, candidaturaId: null, tipo: null });
        }}>
          <div className="form-card p-4 mb-4">
            <h4 className="mb-3">Valutazione Candidato</h4>
            
            <div className="row">
              <div className="col-md-6">
                <div className="mb-4">
                  <label className="form-label">Valutazione Tecnica (1-10)</label>
                  <input 
                    type="number" 
                    name="valutazione_tecnica" 
                    className="form-control" 
                    min="1" 
                    max="10" 
                    defaultValue={isAccettazione ? 8 : 5}
                    required 
                  />
                </div>
              </div>
              <div className="col-md-6">
                <div className="mb-4">
                  <label className="form-label">Valutazione Soft Skills (1-10)</label>
                  <input 
                    type="number" 
                    name="valutazione_soft" 
                    className="form-control" 
                    min="1" 
                    max="10" 
                    defaultValue={isAccettazione ? 8 : 5}
                    required 
                  />
                </div>
              </div>
            </div>
            
            <div className="mb-4">
              <label className="form-label">Motivazione *</label>
              <textarea 
                name="motivazione" 
                className="form-control" 
                rows="4" 
                placeholder={isAccettazione ? 'Descrivi i motivi per cui accetti questa candidatura...' : 'Descrivi i motivi per cui rifiuti questa candidatura...'}
                required
              ></textarea>
            </div>
            
            <div className="mb-3">
              <label className="form-label">Note Private (opzionale)</label>
              <textarea 
                name="note_private" 
                className="form-control" 
                rows="3" 
                placeholder="Note interne per l'azienda (non visibili al candidato)..."
              ></textarea>
            </div>
          </div>
          
          <div className="text-center">
            <button 
              type="submit" 
              className={`view-all-btn me-3 ${isAccettazione ? 'bg-success' : 'bg-danger'}`}
              style={{maxWidth: '200px', backgroundColor: isAccettazione ? '#28a745' : '#dc3545'}}
            >
              <i className={`bi ${isAccettazione ? 'bi-check-circle' : 'bi-x-circle'} me-2`}></i>
              {isAccettazione ? 'Accetta Candidatura' : 'Rifiuta Candidatura'}
            </button>
            <button 
              type="button" 
              className="btn btn-outline-secondary" 
              style={{maxWidth: '200px'}}
              onClick={() => setValutazioneForm({ show: false, candidaturaId: null, tipo: null })}
            >
              <i className="bi bi-x-circle me-2"></i> Annulla
            </button>
          </div>
        </form>
      </div>
    );
  };

  const renderContent = () => {
    if (colloquioForm.show) {
      return renderFissaColloquio();
    }
    
    if (valutazioneForm.show) {
      return renderValutazione();
    }
    
    switch (activeSection) {
      case 'dashboard': return renderDashboard();
      case 'candidature': return renderCandidature();
      case 'offerte': return renderOfferte();
      case 'crea-offerta': return renderCreaOfferta();
      case 'crea-utente': return renderCreaUtente();
      case 'gestisci-utenti': return renderGestisciUtenti();
      case 'profilo-azienda': return renderProfiloAzienda();
      case 'classifica': return renderClassifica();
      case 'dettaglio-candidato': return renderDettaglioCandidato();
      case 'colloqui': return renderColloqui();
      case 'impostazioni': return renderImpostazioni();
      default: return renderDashboard();
    }
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="spinner-border text-light" role="status">
          <span className="visually-hidden">Caricamento...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-sidebar">
        <div className="sidebar-header">
          <img src={logo} alt="Logo" className="sidebar-logo" />
          <div className="user-info">
            <h4>{userData.nome} {userData.cognome}</h4>
            <p>{userData.ruolo} - {aziendaData?.nome || userData.aziendaNome}</p>
          </div>
        </div>

        {renderNavigation()}

        <div className="sidebar-footer">
          <Link to="/Homepage" className="home-link">
            <i className="bi bi-house-fill"></i>
            Homepage
          </Link>
          <button 
            className="logout-btn"
            onClick={() => {
              if (window.confirm('Sei sicuro di voler effettuare il logout?')) {
                sessionStorage.removeItem('userAzienda');
                navigate('/login-azienda');
              }
            }}
          >
            <i className="bi bi-box-arrow-right"></i>
            Logout
          </button>
        </div>
      </div>

      <div className="dashboard-main">
        <div className="main-header">
          <h1>Dashboard Aziendale</h1>
          <div className="header-actions">
            <button 
              className="btn btn-outline-light"
              onClick={loadDashboardData}
              disabled={loading}
            >
              <i className="bi bi-arrow-clockwise"></i>
              {loading ? 'Caricamento...' : 'Aggiorna'}
            </button>
          </div>
        </div>

        <div className="main-content">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default DashboardAzienda;