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
      const response = await loginUtenteCandidato(formData);

      // ✅ Verifica struttura: deve avere jwt e user
      if (!response.jwt || !response.user) {
        throw new Error('Risposta del server non valida');
      }

      alert(`Benvenuto ${response.user.nome}!`);

      // ✅ Salva token e dati utente
      localStorage.setItem('jwt', response.jwt);
      localStorage.setItem('candidato', JSON.stringify(response.user));

      console.log('Token salvato:', localStorage.getItem('jwt'));

      navigate('/dashboard-candidato'); // Redirect
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
                  placeholder="La tua email"
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
              className="btn-login candidate-btn"
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
            <p>Non hai ancora un account?</p>
            <Link to="/registra-candidato" className="register-link candidate-link">
              Registrati come candidato
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginCandidato;
