// DashboardCandidato.js
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getCandidatoProfile, getCandidature, getOfferteConsigliate } from '../services/api.js';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import '../styles/DashboardCandidato.css';
import GestioneCompetenze from './GestioneCompetenze';
import logo from '../assets/logoblack.png';

const DashboardCandidato = () => {
  const [candidato, setCandidato] = useState(null);
  const [candidature, setCandidature] = useState([]);
  const [offerteConsigliate, setOfferteConsigliate] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('dashboard');
  const navigate = useNavigate();

  useEffect(() => {
    // Recupera i dati del candidato dal localStorage o context
    const userData = JSON.parse(localStorage.getItem('candidato') || '{}');
    if (!userData.id) {
      navigate('/login-candidato');
      return;
    }
    
    setCandidato(userData);
    loadDashboardData(userData.id);
  }, [navigate]);

  const loadDashboardData = async (candidatoId) => {
    setLoading(true);
    try {
      // Carica i dati della dashboard
      const [profileData, candidatureData, offerteData] = await Promise.all([
        getCandidatoProfile(candidatoId),
        getCandidature(candidatoId),
        getOfferteConsigliate(candidatoId)
      ]);
      
      setCandidato(profileData);
      setCandidature(candidatureData);
      setOfferteConsigliate(offerteData);
    } catch (error) {
      console.error('Errore nel caricamento dei dati:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('candidato');
    navigate('/');
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Caricamento...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <div className="dashboard-sidebar">
        <div className="sidebar-header">
          <img src={logo} alt="Logo" className="sidebar-logo" />
          <div className="user-info">
            <h4>{candidato?.nome} {candidato?.cognome}</h4>
            <p>{candidato?.email}</p>
          </div>
        </div>

        <nav className="sidebar-nav">
          <button 
            className={`nav-item ${activeSection === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveSection('dashboard')}
          >
            <i className="bi bi-speedometer2"></i>
            <span>Dashboard</span>
          </button>
          
          <button 
            className={`nav-item ${activeSection === 'candidature' ? 'active' : ''}`}
            onClick={() => setActiveSection('candidature')}
          >
            <i className="bi bi-file-earmark-text"></i>
            <span>Le mie Candidature</span>
          </button>
          
          <button 
            className={`nav-item ${activeSection === 'offerte' ? 'active' : ''}`}
            onClick={() => setActiveSection('offerte')}
          >
            <i className="bi bi-briefcase"></i>
            <span>Offerte Consigliate</span>
          </button>
          
          <button 
            className={`nav-item ${activeSection === 'profilo' ? 'active' : ''}`}
            onClick={() => setActiveSection('profilo')}
          >
            <i className="bi bi-person-circle"></i>
            <span>Il mio Profilo</span>
          </button>
          
          <button 
            className={`nav-item ${activeSection === 'formazione' ? 'active' : ''}`}
            onClick={() => setActiveSection('formazione')}
          >
            <i className="bi bi-mortarboard"></i>
            <span>Formazione</span>
          </button>
          
          <button 
            className={`nav-item ${activeSection === 'impostazioni' ? 'active' : ''}`}
            onClick={() => setActiveSection('impostazioni')}
          >
            <i className="bi bi-gear"></i>
            <span>Impostazioni</span>
          </button>
        </nav>

        <div className="sidebar-footer">
          <Link to="/" className="home-link">
            <i className="bi bi-house"></i>
            <span>Torna alla Home</span>
          </Link>
          <button className="logout-btn" onClick={handleLogout}>
            <i className="bi bi-box-arrow-right"></i>
            <span>Esci</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="dashboard-main">
        <div className="main-header">
          <h1>Benvenuto, {candidato?.nome}!</h1>
          <div className="header-actions">
            <button className="btn-notification">
              <i className="bi bi-bell"></i>
              <span className="notification-badge">3</span>
            </button>
          </div>
        </div>

        <div className="main-content">
          {activeSection === 'dashboard' && (
            <div className="dashboard-overview">
              {/* Cards di statistiche */}
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-icon candidate-bg">
                    <i className="bi bi-file-earmark-text"></i>
                  </div>
                  <div className="stat-content">
                    <h3>{candidature.length}</h3>
                    <p>Candidature Inviate</p>
                  </div>
                </div>
                
                <div className="stat-card">
                  <div className="stat-icon success-bg">
                    <i className="bi bi-check-circle"></i>
                  </div>
                  <div className="stat-content">
                    <h3>{candidature.filter(c => c.stato === 'accettata').length}</h3>
                    <p>Candidature Accettate</p>
                  </div>
                </div>
                
                <div className="stat-card">
                  <div className="stat-icon warning-bg">
                    <i className="bi bi-clock"></i>
                  </div>
                  <div className="stat-content">
                    <h3>{candidature.filter(c => c.stato === 'in_attesa').length}</h3>
                    <p>In Attesa di Risposta</p>
                  </div>
                </div>
                
                <div className="stat-card">
                  <div className="stat-icon info-bg">
                    <i className="bi bi-lightbulb"></i>
                  </div>
                  <div className="stat-content">
                    <h3>{offerteConsigliate.length}</h3>
                    <p>Offerte Consigliate</p>
                  </div>
                </div>
              </div>

              {/* Sezioni rapide */}
              <div className="quick-sections">
                <div className="section-card">
                  <h3>Ultime Candidature</h3>
                  <div className="quick-list">
                    {candidature.slice(0, 3).map((candidatura, index) => (
                      <div key={index} className="quick-item">
                        <span className="item-title">{candidatura.titolo_offerta}</span>
                        <span className={`status ${candidatura.stato}`}>
                          {candidatura.stato}
                        </span>
                      </div>
                    ))}
                  </div>
                  <button 
                    className="view-all-btn"
                    onClick={() => setActiveSection('candidature')}
                  >
                    Vedi tutte
                  </button>
                </div>
                
                <div className="section-card">
                  <h3>Offerte per Te</h3>
                  <div className="quick-list">
                    {offerteConsigliate.slice(0, 3).map((offerta, index) => (
                      <div key={index} className="quick-item">
                        <span className="item-title">{offerta.titolo}</span>
                        <span className="item-subtitle">{offerta.azienda}</span>
                      </div>
                    ))}
                  </div>
                  <button 
                    className="view-all-btn"
                    onClick={() => setActiveSection('offerte')}
                  >
                    Vedi tutte
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'candidature' && (
            <div className="candidature-section">
              <h2>Le mie Candidature</h2>
              <p>Qui verrà implementata la sezione candidature...</p>
              {/* Placeholder per la sezione candidature */}
            </div>
          )}

          {activeSection === 'offerte' && (
            <div className="offerte-section">
              <h2>Offerte Consigliate</h2>
              <p>Qui verrà implementata la sezione offerte consigliate...</p>
              {/* Placeholder per la sezione offerte */}
            </div>
          )}

          {activeSection === 'profilo' && (
            <div className="profilo-section">
              <h2>Il mio Profilo</h2>
              <p>Qui verrà implementata la sezione profilo...</p>
              {/* Placeholder per la sezione profilo */}
            </div>
          )}

         {activeSection === 'formazione' && (
  <GestioneCompetenze candidatoId={candidato?.id} />
)}

          {activeSection === 'impostazioni' && (
            <div className="impostazioni-section">
              <h2>Impostazioni</h2>
              <p>Qui verrà implementata la sezione impostazioni...</p>
              {/* Placeholder per la sezione impostazioni */}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardCandidato;