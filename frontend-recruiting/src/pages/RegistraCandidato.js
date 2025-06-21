// RegistraCandidato.js
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registraCandidato } from '../services/api.js';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import '../styles/Login.css';
import logo from '../assets/logo.png';

const RegistraCandidato = () => {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    nome: '',
    cognome: '',
    email: '',
    password: '',
    dataDiNascita: '',
    citta: '',
    provincia: '',
    nazione: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Chiamata alla API per registrare il candidato
      const response = await registraCandidato(formData);
      
      // Debug: stampa la risposta completa per vedere la struttura
      console.log('Risposta completa dalla registrazione:', response);
      
      // Estrai l'ID del candidato dalla struttura corretta
      const candidatoId = response?.candidato?.id;
      
      console.log('ID candidato estratto:', candidatoId);
      
      if (!candidatoId) {
        console.error('Struttura risposta:', response);
        throw new Error('ID candidato non ricevuto dalla registrazione');
      }

      // Salva i dati di login nel localStorage per l'autenticazione
      localStorage.setItem('candidatoId', candidatoId.toString());
      localStorage.setItem('isLoggedIn', 'true');
      
      alert('Registrazione completata con successo! Ora completa il tuo profilo formativo.');
      
      // Naviga direttamente alla gestione formazione con l'ID del candidato
      navigate(`/gestione-formazione/${candidatoId}`);
      
    } catch (error) {
      console.error('Errore durante la registrazione:', error);
      alert(error.message || 'Errore nella registrazione');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="main-container">
      <div className="registration-card">
        {/* Sezione informazioni */}
        <div className="login-info-section candidate-gradient">
          <div className="info-content">
            {/* Logo e pulsante Home */}
            <div className="header-section">
              <img src={logo} alt="Logo" className="info-logo" />
              <Link to="/Homepage" className="home-btn">
                <i className="bi bi-house-fill"></i>
                Torna alla Home
              </Link>
            </div>
            
            <h2>Inizia la tua carriera!</h2>
            <p>
              Registrati sulla nostra piattaforma per accedere alle migliori 
              opportunità di lavoro e dare una svolta alla tua carriera.
            </p>
            <ul className="features-list">
              <li>
                <i className="bi bi-check-circle-fill"></i>
                Accesso a migliaia di offerte
              </li>
              <li>
                <i className="bi bi-check-circle-fill"></i>
                Candidature semplificate
              </li>
              <li>
                <i className="bi bi-check-circle-fill"></i>
                Profilo professionale
              </li>
              <li>
                <i className="bi bi-check-circle-fill"></i>
                Notifiche personalizzate
              </li>
              <li>
                <i className="bi bi-check-circle-fill"></i>
                Supporto nella ricerca
              </li>
            </ul>
          </div>
        </div>

        {/* Sezione form */}
        <div className="form-section">
          <h2 className="form-title">Registrazione Candidato</h2>
          
          <form onSubmit={handleSubmit}>
            {/* Sezione Dati Personali */}
            <div className="section-title">
              <i className="bi bi-person-circle"></i>
              Dati Personali
            </div>

            <div className="form-group">
              <div className="input-group">
                <span className="input-group-text">
                  <i className="bi bi-person-fill"></i>
                </span>
                <input
                  type="text"
                  name="nome"
                  className="form-control"
                  placeholder="Nome"
                  value={formData.nome}
                  onChange={handleChange}
                  required
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div className="form-group">
              <div className="input-group">
                <span className="input-group-text">
                  <i className="bi bi-person-badge-fill"></i>
                </span>
                <input
                  type="text"
                  name="cognome"
                  className="form-control"
                  placeholder="Cognome"
                  value={formData.cognome}
                  onChange={handleChange}
                  required
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div className="form-group">
              <div className="input-group">
                <span className="input-group-text">
                  <i className="bi bi-envelope-fill"></i>
                </span>
                <input
                  type="email"
                  name="email"
                  className="form-control"
                  placeholder="Email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  disabled={isSubmitting}
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
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div className="form-group">
              <div className="input-group">
                <span className="input-group-text">
                  <i className="bi bi-calendar-date"></i>
                </span>
                <input
                  type="date"
                  name="dataDiNascita"
                  className="form-control"
                  value={formData.dataDiNascita}
                  onChange={handleChange}
                  required
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <hr className="section-divider" />

            {/* Sezione Residenza */}
            <div className="section-title">
              <i className="bi bi-geo-alt"></i>
              Residenza
            </div>

            <div className="form-group">
              <div className="input-group">
                <span className="input-group-text">
                  <i className="bi bi-geo-alt"></i>
                </span>
                <input
                  type="text"
                  name="citta"
                  className="form-control"
                  placeholder="Città"
                  value={formData.citta}
                  onChange={handleChange}
                  required
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div className="form-group">
              <div className="input-group">
                <span className="input-group-text">
                  <i className="bi bi-map"></i>
                </span>
                <input
                  type="text"
                  name="provincia"
                  className="form-control"
                  placeholder="Provincia"
                  value={formData.provincia}
                  onChange={handleChange}
                  required
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div className="form-group">
              <div className="input-group">
                <span className="input-group-text">
                  <i className="bi bi-globe"></i>
                </span>
                <input
                  type="text"
                  name="nazione"
                  className="form-control"
                  placeholder="Nazione"
                  value={formData.nazione}
                  onChange={handleChange}
                  required
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <button 
              type="submit" 
              className="btn-register"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status">
                    <span className="visually-hidden">Caricamento...</span>
                  </span>
                  Registrazione in corso...
                </>
              ) : (
                'Registrati'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegistraCandidato;