// Homepage.js
import React from 'react';
import { Link } from 'react-router-dom';
import 'bootstrap-icons/font/bootstrap-icons.css';
import '../styles/homepage.css';
import logo from '../assets/logoblack.png'; // Importa il tuo logo

const Homepage = () => {
  return (
    <div className="homepage-container">
      {/* Sezione Azienda */}
      <div className="company-section">
        <div className="section-content">
          <div className="section-icon">
            <i className="bi bi-building"></i>
          </div>
          <h1 className="section-title">Aziende</h1>
          <p className="section-subtitle">
            Trova i migliori talenti per la tua azienda
          </p>
          <ul className="features-list">
            <li>
              <i className="bi bi-check-circle-fill"></i>
              Pubblica offerte di lavoro
            </li>
            <li>
              <i className="bi bi-check-circle-fill"></i>
              Gestisci candidature
            </li>
            <li>
              <i className="bi bi-check-circle-fill"></i>
              Analisi e reportistica
            </li>
            <li>
              <i className="bi bi-check-circle-fill"></i>
              Supporto dedicato
            </li>
          </ul>
          <div className="buttons-container">
            <Link to="/registra-azienda" className="btn-primary">
              Registra Azienda
            </Link>
            <Link to="/login-azienda" className="btn-secondary">
              Accedi come Utente Aziendale
            </Link>
          </div>
        </div>
      </div>

      {/* Linea divisoria centrale */}
      <div className="divider"></div>

      {/* Logo centrale - ORA CON IL TUO LOGO PERSONALIZZATO */}
      <div className="central-logo">
        <img src={logo} alt="Logo" className="logo-image" />
      </div>

      {/* Sezione Candidato */}
      <div className="candidate-section">
        <div className="section-content">
          <div className="section-icon">
            <i className="bi bi-person-circle"></i>
          </div>
          <h1 className="section-title">Candidati</h1>
          <p className="section-subtitle">
            Trova il lavoro dei tuoi sogni
          </p>
          <ul className="features-list">
            <li>
              <i className="bi bi-check-circle-fill"></i>
              Cerca offerte di lavoro
            </li>
            <li>
              <i className="bi bi-check-circle-fill"></i>
              Carica il tuo CV
            </li>
            <li>
              <i className="bi bi-check-circle-fill"></i>
              Candidature facili
            </li>
            <li>
              <i className="bi bi-check-circle-fill"></i>
              Notifiche personalizzate
            </li>
          </ul>
          <div className="buttons-container">
            <Link to="/registra-candidato" className="btn-primary">
              Registrati
            </Link>
            <Link to="/login-candidato" className="btn-secondary">
              Accedi come Candidato
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Homepage;