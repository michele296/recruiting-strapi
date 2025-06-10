// registrazioneAzienda.js
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { registraAzienda as registraAziendaApi } from '../services/api.js';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import '../styles/RegistraAzienda.css';
import logo from '../assets/logo.png'; // Importa il tuo logo

const RegistraAzienda = () => {
  const [formData, setFormData] = useState({
    nomeAzienda: '',
    partitaIva: '',
    citta: '',
    provincia: '',
    nazione: '',
    nome: '',
    cognome: '',
    email: '',
    password: '',
    dataDiNascita: '',
    ruolo: 'REFERENTE',
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await registraAziendaApi(formData);
      alert('Azienda registrata con successo!');
    } catch (error) {
      console.error(error);
      alert('Errore nella registrazione');
    }
  };

  return (
    <div className="main-container">
      <div className="registration-card">
        {/* Sezione informazioni */}
        <div className="info-section">
          <div className="info-content">
            {/* Logo e pulsante Home */}
            <div className="header-section">
              <img src={logo} alt="Logo" className="info-logo" />
              <Link to="/Homepage" className="home-btn">
                <i className="bi bi-house-fill"></i>
                Torna alla Home
              </Link>
            </div>
            
            <h2>Benvenuti nel nostro sistema di recruiting!</h2>
            <p>
              Registra la tua azienda per accedere alla nostra piattaforma di gestione 
              dei talenti e semplificare il processo di assunzione.
            </p>
            <ul className="features-list">
              <li>
                <i className="bi bi-check-circle-fill"></i>
                Gestione completa dei candidati
              </li>
              <li>
                <i className="bi bi-check-circle-fill"></i>
                Pubblicazione offerte di lavoro
              </li>
              <li>
                <i className="bi bi-check-circle-fill"></i>
                Gestione offerte di lavoro
              </li>
              <li>
                <i className="bi bi-check-circle-fill"></i>
                Chiarezza sulle competenze dei candidati
              </li>
              <li>
                <i className="bi bi-check-circle-fill"></i>
                Integrazione con sistemi HR
              </li>
            </ul>
          </div>
        </div>

        {/* Sezione form */}
        <div className="form-section">
          <h2 className="form-title">Registrazione Azienda</h2>
          
          <form onSubmit={handleSubmit}>
            {/* Sezione Dati Azienda */}
            <div className="section-title">
              <i className="bi bi-building"></i>
              Dati Azienda
            </div>

            <div className="form-group">
              <div className="input-group">
                <span className="input-group-text">
                  <i className="bi bi-building"></i>
                </span>
                <input
                  type="text"
                  name="nomeAzienda"
                  className="form-control"
                  placeholder="Nome Azienda"
                  value={formData.nomeAzienda}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <div className="input-group">
                <span className="input-group-text">
                  <i className="bi bi-receipt"></i>
                </span>
                <input
                  type="text"
                  name="partitaIva"
                  className="form-control"
                  placeholder="Partita IVA"
                  value={formData.partitaIva}
                  onChange={handleChange}
                  required
                />
              </div>
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
                />
              </div>
            </div>

            <hr className="section-divider" />

            {/* Sezione Dati Referente */}
            <div className="section-title">
              <i className="bi bi-person-badge"></i>
              Dati Referente Aziendale
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
                />
              </div>
            </div>

            <input type="hidden" name="ruolo" value={formData.ruolo} />

            <button type="submit" className="btn-register">
              Registra Azienda
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegistraAzienda;