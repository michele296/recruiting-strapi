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
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await loginUtenteAziendale(formData);
      alert(`Benvenuto ${response.nome}!`);
      // Qui puoi salvare i dati utente in localStorage o context
      // localStorage.setItem('user', JSON.stringify(response));
      navigate('/dashboard-azienda'); // Redirect alla dashboard
    } catch (error) {
      console.error(error);
      alert(error.message || 'Errore nel login');
    } finally {
      setLoading(false);
    }
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
          
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <div className="input-group">
                <span className="input-group-text">
                  <i className="bi bi-envelope-fill"></i>
                </span>
                <input
                  type="email"
                  name="email"
                  className="form-control"
                  placeholder="Email aziendale"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <div className="input-group">
                <span className="input-group-text">
                  <i className="bi bi-lock-fill"></i>
                </span>
                <input
                  type="password"
                  name="password"
                  className="form-control"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <button 
              type="submit" 
              className="btn-login"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                  Accesso in corso...
                </>
              ) : (
                'Accedi'
              )}
            </button>
          </form>

          <div className="login-footer">
            <p>Non hai ancora un account aziendale?</p>
            <Link to="/registra-azienda" className="register-link">
              Registra la tua azienda
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginAzienda;