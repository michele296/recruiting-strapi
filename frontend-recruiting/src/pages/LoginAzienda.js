// LoginAzienda.js
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { loginUtenteAziendale } from '../services/api.js';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import '../styles/Login.css';
import logo from '../assets/logo.png';

const LoginAzienda = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    // Rimuovi errore quando l'utente inizia a digitare
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const response = await loginUtenteAziendale(formData);
      console.log('Risposta login:', response);
      
      // Estrai i dati utente dalla risposta
      const user = response.user;
      const userId = user.id;
      const nome = user.nome;
      const cognome = user.cognome;
      const ruolo = user.ruolo;
      
      // Estrai i dati dell'azienda dalla risposta del login
      const aziendaId = user.aziendaId || user.azienda?.id;
      const aziendaNome = user.azienda?.nome;
      
      // Costruisci l'URL con i parametri necessari per la dashboard
      const dashboardUrl = `/dashboard-azienda?` + 
        `userId=${userId}&` +
        `nome=${encodeURIComponent(nome)}&` +
        `cognome=${encodeURIComponent(cognome)}&` +
        `ruolo=${encodeURIComponent(ruolo)}&` +
        `aziendaId=${aziendaId}&` +
        `aziendaNome=${encodeURIComponent(aziendaNome)}`;
      
      // Salva i dati utente nel sessionStorage
      sessionStorage.setItem('userAzienda', JSON.stringify({
        id: userId,
        nome: nome,
        cognome: cognome,
        email: user.email,
        ruolo: ruolo,
        azienda: user.azienda,
        aziendaId: aziendaId,
        loginTime: new Date().toISOString()
      }));
      
      // Mostra messaggio di successo
      alert(`Benvenuto ${nome}!`);
      
      // Naviga alla dashboard
      navigate(dashboardUrl);
      
    } catch (error) {
      console.error('Errore login:', error);
      setError(error.message || 'Errore durante il login. Riprova.');
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="login-container">
      <div className="login-card">
        {/* Sezione informazioni */}
        <div className="login-info-section">
          <div className="info-content">
            {/* Logo e pulsante Home */}
            <div className="header-section">
              <img src={logo} alt="Logo" className="info-logo" />
              <Link to="/Homepage" className="home-btn">
                <i className="bi bi-house-fill"></i>
                Torna alla Home
              </Link>
            </div>
            
            <div className="welcome-icon">
              <i className="bi bi-building"></i>
            </div>
            <h2>Accesso Aziendale</h2>
            <p>
              Accedi al tuo account aziendale per gestire le tue offerte di lavoro 
              e trovare i migliori candidati.
            </p>
            <ul className="features-list">
              <li>
                <i className="bi bi-check-circle-fill"></i>
                Dashboard completa
              </li>
              <li>
                <i className="bi bi-check-circle-fill"></i>
                Gestione candidature
              </li>
              <li>
                <i className="bi bi-check-circle-fill"></i>
                Statistiche dettagliate
              </li>
              <li>
                <i className="bi bi-check-circle-fill"></i>
                Supporto dedicato
              </li>
            </ul>
          </div>
        </div>

        {/* Sezione form */}
        <div className="login-form-section">
          <h2 className="form-title">Accedi come Azienda</h2>
          
          {/* Messaggio di errore */}
          {error && (
            <div className="alert alert-danger" role="alert">
              <i className="bi bi-exclamation-triangle-fill me-2"></i>
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <div className="input-group">
                <span className="input-group-text">
                  <i className="bi bi-envelope-fill"></i>
                </span>
                <input
                  type="email"
                  name="email"
                  className={`form-control ${error ? 'is-invalid' : ''}`}
                  placeholder="Email aziendale"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="form-group">
              <div className="input-group">
                <span className="input-group-text">
                  <i className="bi bi-lock-fill"></i>
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  className={`form-control ${error ? 'is-invalid' : ''}`}
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={togglePasswordVisibility}
                  disabled={loading}
                  aria-label={showPassword ? "Nascondi password" : "Mostra password"}
                >
                  <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                </button>
              </div>
            </div>

            <button 
              type="submit" 
              className="btn-login"
              disabled={loading || !formData.email || !formData.password}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Accesso in corso...
                </>
              ) : (
                <>
                  <i className="bi bi-box-arrow-in-right me-2"></i>
                  Accedi
                </>
              )}
            </button>
          </form>



          <div className="login-footer">
            <p>Non hai ancora un account aziendale?</p>
            <Link to="/registra-azienda" className="register-link">
              <i className="bi bi-building-add me-2"></i>
              Registra la tua azienda
            </Link>
          </div>

          {/* Link di accesso alternativo */}
          <div className="alternative-login">
            <hr className="divider" />
            <p className="text-muted">Oppure</p>
            <Link to="/login-candidato" className="btn btn-outline-secondary w-100">
              <i className="bi bi-person-fill me-2"></i>
              Accedi come Candidato
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginAzienda;