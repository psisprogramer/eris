import { useNavigate } from 'react-router-dom';
import './MissionCard.css';

export default function MissionCard({ mission, completed = false, locked = false, index = 0 }) {
  const nav = useNavigate();
  return (
    <article
      className={`mission-card ${completed ? 'is-done' : ''} ${locked ? 'is-locked' : ''}`}
      onClick={() => !locked && nav(`/simulation/${mission.id}`)}
      style={{ animationDelay: `${index * 90}ms` }}
    >
      <div className="mission-code">
        <span className="mission-codename">{mission.codename}</span>
        <span className={`mission-status ${completed ? 'done' : ''}`}>
          {completed ? '◉ COMPLETADA' : '○ DISPONIBLE'}
        </span>
      </div>
      <h4 className="mission-title">{mission.title}</h4>
      <p className="mission-subtitle">{mission.subtitle}</p>
      <div className="mission-foot">
        <span className="mission-focus">{focusLabel(mission.focus)}</span>
        <span className="mission-arrow">→</span>
      </div>
    </article>
  );
}

function focusLabel(focus) {
  switch (focus) {
    case 'mass':     return 'Manipulación de masa';
    case 'velocity': return 'Equilibrio orbital';
    case 'free':     return 'Observación libre';
    default:         return 'Exploración';
  }
}
