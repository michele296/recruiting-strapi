import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { loginUtenteCandidato } from '../services/api.js';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import '../styles/Login.css';
import logo from '../assets/logo.png';

const LoginCandidato = () => {
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
    if (error) setError('');
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await loginUtenteCandidato(formData);  

      if (!response.user) {
        throw new Error('Risposta del server non valida');
      }

      alert(`Benvenuto ${response.user.nome}!`);

      localStorage.setItem('candidatoId', response.user.id.toString());
      localStorage.setItem('candidato', JSON.stringify(response.user));
      localStorage.setItem('isLoggedIn', 'true');

      navigate('/dashboard-candidato');
    } catch (error) {
      console.error('Errore login:', error);
      setError(error.message || 'Errore durante il login. Riprova.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        {/* Sezione informazioni */}
        <div className="login-info-section candidate-gradient">
          <div className="info-content">
            <div className="header-section">
              <img src={logo} alt="Logo" className="info-logo" />
              <Link to="/Homepage" className="home-btn">
                <i className="bi bi-house-fill"></i>
                Torna alla Home
              </Link>
            </div>
            <div className="welcome-icon">
              <i className="bi bi-person-circle"></i>
            </div>
            <h2>Bentornato!</h2>
            <p>
              Accedi al tuo account per continuare la ricerca del lavoro perfetto 
              e gestire le tue candidature.
            </p>
            <ul className="features-list">
              <li><i className="bi bi-check-circle-fill"></i> Offerte personalizzate</li>
              <li><i className="bi bi-check-circle-fill"></i> Candidature salvate</li>
              <li><i className="bi bi-check-circle-fill"></i> Stato candidature</li>
              <li><i className="bi bi-check-circle-fill"></i> Notifiche istantanee</li>
            </ul>
          </div>
        </div>

        {/* Sezione form */}
        <div className="login-form-section">
          <h2 className="form-title">Accedi come Candidato</h2>
          
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
                  placeholder="La tua email"
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
              className="btn-login candidate-btn"
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
            <p>Non hai ancora un account?</p>
            <Link to="/registra-candidato" className="register-link candidate-link">
              <i className="bi bi-person-add me-2"></i>
              Registrati come candidato
            </Link>
          </div>

          {/* Link di accesso alternativo */}
          <div className="alternative-login">
            <hr className="divider" />
            <p className="text-muted">Oppure</p>
            <Link to="/login-azienda" className="btn btn-outline-secondary w-100">
              <i className="bi bi-building me-2"></i>
              Accedi come Azienda
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginCandidato;