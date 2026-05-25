/* ============================================================
   ERIS · Debrief / Bitacora reflexiva
   ============================================================ */

import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getMission, missions } from '../data/missions.js';
import SpaceBackground from '../scenes/SpaceBackground.jsx';
import HoloPanel from '../components/HoloPanel.jsx';
import HoloButton from '../components/HoloButton.jsx';
import { useMissionProgress } from '../hooks/useMissionProgress.jsx';
import '../styles/debrief.css';

function DebriefQuestion({ dq }) {
  const [picked, setPicked] = useState(null);
  const [revealed, setRevealed] = useState(false);
  if (!dq) return null;
  const letters = ['A', 'B', 'C', 'D'];

  function handleConfirm() {
    if (picked === null) return;
    setRevealed(true);
  }

  return (
    <div className="dq">
      <p className="dq-label">PREGUNTA DE REFLEXION</p>
      <p className="dq-text">{dq.q}</p>
      <ul className="dq-options">
        {dq.options.map((opt, i) => {
          const isPicked  = picked === i;
          const isCorrect = revealed && i === dq.correct;
          const isWrong   = revealed && isPicked && i !== dq.correct;
          return (
            <li key={i}>
              <button
                className={'dq-opt' + (isPicked ? ' is-picked' : '') + (isCorrect ? ' is-correct' : '') + (isWrong ? ' is-wrong' : '')}
                onClick={() => !revealed && setPicked(i)}
                disabled={revealed}
              >
                <span className="dq-letter">{letters[i]}</span>
                <span className="dq-opt-text">{opt}</span>
                {isCorrect && <span className="dq-mark">&#10003;</span>}
                {isWrong   && <span className="dq-mark dq-mark--wrong">&#215;</span>}
              </button>
            </li>
          );
        })}
      </ul>
      {!revealed ? (
        <button className="dq-confirm" onClick={handleConfirm} disabled={picked === null}>
          CONFIRMAR
        </button>
      ) : (
        <p className="dq-feedback">
          {picked === dq.correct
            ? 'Correcto. Tu observación fue precisa.'
            : 'No exacto. Vuelve a la simulación y observa con atención.'}
        </p>
      )}
    </div>
  );
}

export default function Debrief() {
  const { missionId } = useParams();
  const nav = useNavigate();
  const mission = getMission(missionId);
  const { addLog, logs } = useMissionProgress();
  const [note, setNote] = useState('');

  const missionLogs = logs.filter((l) => l.missionId === mission.id);
  const idx  = missions.findIndex((m) => m.id === mission.id);
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
          <button className="hub-exit" onClick={() => nav('/hub')}>&#8592; HUB</button>
        </header>

        <section className="debrief-center fade-up">
          <p className="label">DESCUBRIMIENTO</p>
          <h1 className="debrief-title">{mission.title}</h1>
          <blockquote className="debrief-quote">
            &#8220;{mission.discovery}&#8221;
          </blockquote>

          {mission.debriefQuestion && (
            <HoloPanel
              title="Comprueba lo aprendido"
              subtitle="Basado en lo que observaste en la simulación"
              className="debrief-questions"
            >
              <DebriefQuestion dq={mission.debriefQuestion} />
            </HoloPanel>
          )}

          <HoloPanel title="Tus observaciones" subtitle="¿Qué notaste durante la simulación?">
            <textarea
              className="logbook"
              placeholder="Describe lo que observaste, lo que te sorprendió o lo que entendiste. Escribe con tus propias palabras."
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
                      {new Date(l.timestamp).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <p>{l.text}</p>
                  </li>
                ))}
              </ul>
            )}
          </HoloPanel>

          <div className="debrief-actions">
            <HoloButton variant="ghost" onClick={() => nav('/simulation/' + mission.id)}>
              &#8635; Volver a observar
            </HoloButton>
            {next ? (
              <HoloButton onClick={() => nav('/simulation/' + next.id)}>
                Siguiente misión: {next.title} &#8594;
              </HoloButton>
            ) : (
              <HoloButton onClick={() => nav('/hub')}>
                Volver al centro de operaciones &#8594;
              </HoloButton>
            )}
          </div>
        </section>

        <footer className="debrief-foot fade-in">
          <span className="label">&#8220;El universo no se memoriza. Se observa.&#8221;</span>
        </footer>
      </div>
    </div>
  );
}
