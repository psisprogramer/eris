/* ============================================================
   ExperimentQuiz · ERIS
   Microevaluación elegante después de experimentar.
   3 preguntas de opción múltiple integradas a la simulación.
   ============================================================ */

import { useState } from 'react';
import './ExperimentQuiz.css';

/**
 * questions: [
 *   { q: '¿…?', options: ['A', 'B', 'C'], correct: 1 }
 * ]
 */
export default function ExperimentQuiz({
  questions = [],
  onComplete,
  onClose,
}) {
  const [step, setStep] = useState(0);
  const [picked, setPicked] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [revealed, setRevealed] = useState(false);

  if (!questions.length) return null;
  const total = questions.length;
  const q = questions[step];

  function selectOption(idx) {
    if (revealed) return;
    setPicked(idx);
  }

  function confirm() {
    if (picked === null) return;
    setRevealed(true);
  }

  function next() {
    const nextAnswers = [...answers, { picked, correct: picked === q.correct }];
    if (step + 1 < total) {
      setAnswers(nextAnswers);
      setStep(step + 1);
      setPicked(null);
      setRevealed(false);
    } else {
      onComplete?.(nextAnswers);
    }
  }

  return (
    <div className="quiz">
      <header className="quiz-head">
        <div className="quiz-meta">
          <span className="quiz-tag">COMPRENSIÓN</span>
          <span className="quiz-step">{String(step + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}</span>
        </div>
        {onClose && (
          <button className="quiz-close" onClick={onClose} aria-label="Cerrar">
            ×
          </button>
        )}
      </header>

      <div className="quiz-progress">
        <div className="quiz-progress-fill" style={{ width: `${((step + (revealed ? 1 : 0)) / total) * 100}%` }} />
      </div>

      <h3 className="quiz-question">{q.q}</h3>

      <ul className="quiz-options">
        {q.options.map((opt, i) => {
          const isPicked = picked === i;
          const isCorrect = revealed && i === q.correct;
          const isWrong = revealed && isPicked && i !== q.correct;
          const letter = String.fromCharCode(65 + i);

          return (
            <li key={i}>
              <button
                className={`quiz-option ${isPicked ? 'is-picked' : ''} ${isCorrect ? 'is-correct' : ''} ${isWrong ? 'is-wrong' : ''}`}
                onClick={() => selectOption(i)}
                disabled={revealed}
              >
                <span className="quiz-letter">{letter}</span>
                <span className="quiz-text">{opt}</span>
                {isCorrect && <span className="quiz-mark">✓</span>}
                {isWrong && <span className="quiz-mark wrong">×</span>}
              </button>
            </li>
          );
        })}
      </ul>

      <div className="quiz-actions">
        {!revealed ? (
          <button
            className="quiz-cta"
            onClick={confirm}
            disabled={picked === null}
          >
            CONFIRMAR →
          </button>
        ) : (
          <>
            <p className="quiz-feedback">
              {picked === q.correct
                ? 'Has observado bien.'
                : 'No exacto. Mira otra vez. La gravedad no engaña.'}
            </p>
            <button className="quiz-cta" onClick={next}>
              {step + 1 < total ? 'SIGUIENTE →' : 'FINALIZAR →'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
