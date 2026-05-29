/* ============================================================
   ERIS · Debrief / Bitácora reflexiva
   Pantalla silenciosa. El descubrimiento se asienta aquí.
   ============================================================ */

import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getMission, missions } from '../data/missions.js';
import SpaceBackground from '../scenes/SpaceBackground.jsx';
import HoloPanel from '../components/HoloPanel.jsx';
import HoloButton from '../components/HoloButton.jsx';
import { useMissionProgress } from '../hooks/useMissionProgress.jsx';
import '../styles/debrief.css';

export default function Debrief() {
  const { missionId } = useParams();
  const nav = useNavigate();
  const mission = getMission(missionId);
  const { addLog, logs } = useMissionProgress();
  const [note, setNote] = useState('');

  const missionLogs = logs.filter((l) => l.missionId === mission.id);
  const idx = missions.findIndex((m) => m.id === mission.id);
  const next = missions[idx + 1];

  function handleSave() {
    addLog(mission.id, note);
    setNote('');
  }

  return (
    <div className="debrief full-screen vignette">
      <SpaceBackground intensity={0.7} drift={false} />

      <div className="debrief-overlay">
        <header className="debrief-top fade-in">
          <span className="label">{mission.codename} · BITÁCORA</span>
          <button className="hub-exit" onClick={() => nav('/hub')}>← HUB</button>
        </header>

        <section className="debrief-center fade-up">
          <p className="label">DESCUBRIMIENTO</p>
          <h1 className="debrief-title">{mission.title}</h1>

          <blockquote className="debrief-quote">
            "{mission.discovery}"
          </blockquote>

          <HoloPanel
            title="Preguntas abiertas"
            subtitle="No hay respuestas correctas, sólo respuestas honestas"
            className="debrief-questions"
          >
            <ol>
              {mission.questions.map((q, i) => (
                <li key={i}>{q}</li>
              ))}
            </ol>
          </HoloPanel>

          <HoloPanel title="Tu bitácora" subtitle="¿Qué te llamó la atención?">
            <textarea
              className="logbook"
              placeholder="Escribe libremente lo que observaste, sentiste o entendiste. Nadie corrige aquí."
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
            <div className="logbook-actions">
              <span className="label">{note.length} caracteres</span>
              <HoloButton size="sm" variant="ghost" onClick={handleSave} disabled={!note.trim()}>
                Guardar entrada
              </HoloButton>
            </div>
            {missionLogs.length > 0 && (
              <ul className="log-entries">
                {missionLogs.slice().reverse().map((l, i) => (
                  <li key={i}>
                    <span className="log-time">
                      {new Date(l.timestamp).toLocaleTimeString('es-MX', {
                        hour: '2-digit', minute: '2-digit'
                      })}
                    </span>
                    <p>{l.text}</p>
                  </li>
                ))}
              </ul>
            )}
          </HoloPanel>

          <div className="debrief-actions">
            <HoloButton variant="ghost" onClick={() => nav(`/simulation/${mission.id}`)}>
              ⟲ Volver a observar
            </HoloButton>
            {next ? (
              <HoloButton onClick={() => nav(`/simulation/${next.id}`)}>
                Siguiente misión: {next.title} →
              </HoloButton>
            ) : (
              <HoloButton onClick={() => nav('/hub')}>
                Volver al centro de operaciones →
              </HoloButton>
            )}
          </div>
        </section>

        <footer className="debrief-foot fade-in">
          <span className="label">
            "El universo no se memoriza. Se observa."
          </span>
        </footer>
      </div>
    </div>
  );
}
