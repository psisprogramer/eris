/* ============================================================
   ERIS · Asistente holográfico
   Opcional, no invasivo. Cálido, científico, minimalista.
   Si recibe `lines`, las muestra una a una.
   ============================================================ */

import { useEffect, useState } from 'react';
import './AIAssistant.css';

const DEFAULT_LINES = [
  'Sistemas estables. Bienvenida, exploradora.',
  'No tengas miedo de equivocarte. El universo aprende a equivocarse hace 13.800 millones de años.',
];

export default function AIAssistant({
  name = 'ERIS·AI',
  lines = DEFAULT_LINES,
  compact = false,
}) {
  const [displayed, setDisplayed] = useState('');
  const [lineIdx, setLineIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(0);

  useEffect(() => {
    if (!lines.length) return;
    const current = lines[lineIdx % lines.length];
    if (charIdx <= current.length) {
      const t = setTimeout(() => {
        setDisplayed(current.slice(0, charIdx));
        setCharIdx((c) => c + 1);
      }, 22);
      return () => clearTimeout(t);
    } else {
      const pause = setTimeout(() => {
        setCharIdx(0);
        setLineIdx((i) => i + 1);
      }, 4200);
      return () => clearTimeout(pause);
    }
  }, [charIdx, lineIdx, lines]);

  return (
    <div className={`ai-assistant ${compact ? 'compact' : ''}`}>
      <div className="ai-avatar">
        <div className="ai-core" />
        <div className="ai-ring r1" />
        <div className="ai-ring r2" />
      </div>
      <div className="ai-message">
        <span className="ai-name">{name}</span>
        <p className="ai-text">
          {displayed}
          <span className="ai-caret">▍</span>
        </p>
      </div>
    </div>
  );
}
