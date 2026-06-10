/* ============================================================
   ERIS · Debrief / Bitácora reflexiva
   - Pregunta de observación A/B/C/D (respuesta correcta).
   - Bitácora personal de texto libre.
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
  const [picked, setPicked] = useState(null);
  const [revealed, setRevealed] = useState(false);

  const missionLogs = logs.filter((l) => l.missionId === mission.id);
  const idx = missions.findIndex((m) => m.id === mission.id);
  const next = missions[idx + 1];
  const dq = mission.debriefQuestion;

  function handleSave() {
    addLog(mission.id, note);
    setNote('');
  }

  function confirmAnswer() {
    if (picked === null) return;
    setRevealed(true);
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

          {/* ---- Pregunta de observación A/B/C/D ---- */}
          {dq && (
            <HoloPanel
              title="Pregunta de observación"
              subtitle="Lo que viste en la simulación"
              className="debrief-observation"
            >
              <p className="observation-q">{dq.q}</p>
              <ul className="observation-options">
                {dq.options.map((opt, i) => {
                  const letter = String.fromCharCode(65 + i);
                  const isPicked = picked === i;
                  const isCorrect = revealed && i === dq.correct;
                  const isWrong = revealed && isPicked && i !== dq.correct;
                  return (
                    <li key={i}>
                      <button
                        type="button"
                        className={`observation-opt ${isPicked ? 'is-picked' : ''} ${isCorrect ? 'is-correct' : ''} ${isWrong ? 'is-wrong' : ''}`}
                        onClick={() => !revealed && setPicked(i)}
                        disabled={revealed}
                      >
                        <span className="observation-letter">{letter}</span>
                        <span className="observation-text">{opt}</span>
                        {isCorrect && <span className="observation-mark">✓</span>}
                        {isWrong && <span className="observation-mark wrong">×</span>}
                      </button>
                    </li>
                  );
                })}
              </ul>
              {!revealed && (
                <div className="observation-actions">
                  <HoloButton size="sm" onClick={confirmAnswer} disabled={picked === null}>
                    Confirmar respuesta
                  </HoloButton>
                </div>
              )}
              {revealed && (
                <p className="observation-feedback">
                  {picked === dq.correct
                    ? 'Has observado bien. Eso es exactamente lo que ocurrió en el espacio.'
                    : 'No exacto. Vuelve a mirar la simulación con calma — la geometría te lo dice todo.'}
                </p>
              )}
            </HoloPanel>
          )}

          {/* ---- Bitácora personal ---- */}
          <HoloPanel title="Observaciones" subtitle="Tu bitácora libre">
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
