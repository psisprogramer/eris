/* ============================================================
   ERIS · Hub / Centro de Operaciones
   Bitácora con acordeón en móvil para liberar espacio.
   ============================================================ */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { missions } from '../data/missions.js';
import MissionCard from '../components/MissionCard.jsx';
import HubScene from '../scenes/HubScene.jsx';
import { useMissionProgress } from '../hooks/useMissionProgress.jsx';
import '../styles/hub.css';

export default function Hub() {
  const nav = useNavigate();
  const { completed, discoveries } = useMissionProgress();
  const completedCount = Object.keys(completed).length;
  const pct = Math.round((completedCount / missions.length) * 100);

  // En móvil empieza cerrado; en desktop la clase CSS lo fuerza abierto.
  const [missionsOpen, setMissionsOpen] = useState(false);

  return (
    <div className="hub full-screen vignette aberration">
      <HubScene />

      <div className="hub-overlay">
        {/* ---- Topbar ---- */}
        <header className="hub-top">
          <span className="brand">
            <span className="brand-dot breathe" />
            <span className="brand-name">ERIS</span>
            <span className="brand-sep">·</span>
            <span className="brand-version">CENTRO DE OPERACIONES</span>
          </span>
          <div className="hub-top-right">
            <span className="label-quiet">MISIONES · {completedCount}/{missions.length}</span>
            <span className="label-quiet">DESCUBRIMIENTOS · {discoveries.length}</span>
            <button className="hub-exit" onClick={() => nav('/')}>← SALIR</button>
          </div>
        </header>

        {/* ---- Holograma central (info en la base) ---- */}
        <div className="hub-center-text">
          <p className="label">SISTEMA OBSERVADO · ERIS-VII</p>
          <h2 className="hub-title">Geometría del universo</h2>
          <p className="hub-quote">
            La gravedad no tira de los objetos.<br />
            <em>Es la forma en que se mueve el espacio.</em>
          </p>
        </div>

        {/* ---- Bitácora ---- */}
        <aside className={`hub-missions ${missionsOpen ? 'is-open' : ''}`}>
          <button
            type="button"
            className="missions-head"
            onClick={() => setMissionsOpen((s) => !s)}
            aria-expanded={missionsOpen}
            aria-controls="missions-body"
          >
            <span className="label">MODOS DE EXPERIMENTACIÓN</span>
            <span className="missions-count">{String(completedCount).padStart(2, '0')} / {String(missions.length).padStart(2, '0')}</span>
            <span className="missions-chevron" aria-hidden="true">
              <svg viewBox="0 0 12 12" width="12" height="12">
                <path d="M2 4 L6 8 L10 4" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </span>
          </button>

          <div className="missions-body" id="missions-body">
            <div className="mission-list">
              {missions.map((m, i) => (
                <MissionCard
                  key={m.id}
                  mission={m}
                  index={i}
                  completed={!!completed[m.id]}
                />
              ))}
            </div>

            <div className="missions-progress">
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${pct}%` }} />
              </div>
              <span className="progress-pct">{pct}%</span>
            </div>
          </div>
        </aside>

        {/* ---- Descubrimientos ---- */}
        {discoveries.length > 0 && (
          <aside className="hub-discoveries">
            <span className="label">BITÁCORA</span>
            <ul className="discovery-list">
              {discoveries.slice(-3).reverse().map((d, i) => (
                <li key={i}>
                  <span className="dot" />
                  <span>{d.text}</span>
                </li>
              ))}
            </ul>
          </aside>
        )}

        {/* ---- Bottombar ---- */}
        <footer className="hub-bottom">
          <span className="label-quiet">SISTEMAS · NOMINALES</span>
          <span className="bot-sep" />
          <span className="label-quiet">ω · 0.012 rad/s</span>
          <span className="bot-sep" />
          <span className="label-quiet">T-EXT · −270.4 °C</span>
          <span className="bot-sep" />
          <span className="label-quiet">SECTOR · ERIS-VII</span>
        </footer>

        <span className="hud-corner tl" />
        <span className="hud-corner tr" />
        <span className="hud-corner bl" />
        <span className="hud-corner br" />
      </div>
    </div>
  );
}
