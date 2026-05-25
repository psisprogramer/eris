/* ============================================================
   ControlConsole · ERIS
   Barra flotante inferior — instrumental orbital.
   Cinco diales + botón central play/pause.
   ============================================================ */

import { useState } from 'react';
import Dial from './Dial.jsx';
import './ControlConsole.css';

export default function ControlConsole({
  // Valores
  mass, distance, velocity, simSpeed,
  // Rangos
  massRange = [5, 200],
  distanceRange = [3, 14],
  velocityRange = [0, 8],
  // Setters
  onMassChange,
  onDistanceChange,
  onVelocityChange,
  onSpeedChange,
  // Estado
  running,
  onToggleRun,
  onReset,
  onHelp,
  elapsedLabel = '00:00',
}) {
  const [helpOpen, setHelpOpen] = useState(false);

  return (
    <div className="console">
      {/* Botón help — abajo izquierda */}
      <button
        className="console-help"
        onClick={() => { setHelpOpen((s) => !s); onHelp?.(); }}
        title="Cómo funciona"
        aria-label="Ayuda"
      >
        <span>?</span>
      </button>

      {/* Mini panel de ayuda contextual */}
      {helpOpen && (
        <div className="console-help-panel">
          <p className="console-help-title">CONSOLA</p>
          <p>Arrastra los diales para cambiar el sistema. Doble-clic centra el valor. Scroll también funciona.</p>
          <p><strong>Masa</strong> · cuánto curva el espacio.</p>
          <p><strong>Distancia</strong> · qué tan lejos orbita la sonda.</p>
          <p><strong>Velocidad</strong> · qué tan rápido se mueve la sonda.</p>
          <p><strong>Tiempo</strong> · ritmo de la simulación.</p>
        </div>
      )}

      {/* Console body */}
      <div className="console-body">
        <span className="console-tab tab-left">SISTEMA · ERIS-VII</span>
        <span className="console-tab tab-right">T+ {elapsedLabel}</span>

        <div className="console-dials">
          <Dial
            label="Masa"
            value={mass}
            min={massRange[0]}
            max={massRange[1]}
            step={1}
            unit="M⊙"
            decimals={1}
            size="md"
            variant="amber"
            onChange={onMassChange}
          />
          <Dial
            label="Distancia"
            value={distance}
            min={distanceRange[0]}
            max={distanceRange[1]}
            step={0.1}
            unit="AU"
            decimals={2}
            size="md"
            variant="neutral"
            onChange={onDistanceChange}
          />

          {/* Centro: botón grande play/pause */}
          <div className="console-center">
            <button
              className={`console-runner ${running ? 'is-running' : ''}`}
              onClick={onToggleRun}
              aria-label={running ? 'Pausar simulación' : 'Iniciar simulación'}
            >
              <svg viewBox="0 0 100 100" className="runner-svg">
                <circle cx="50" cy="50" r="44" className="runner-track" />
                <circle cx="50" cy="50" r="44" className="runner-fill" />
                <circle cx="50" cy="50" r="28" className="runner-core" />
                {/* Marcas radiales */}
                {Array.from({ length: 24 }).map((_, i) => {
                  const a = (i * 360 / 24) * Math.PI / 180;
                  const r1 = 38, r2 = 41;
                  return (
                    <line
                      key={i}
                      x1={50 + Math.cos(a) * r1}
                      y1={50 + Math.sin(a) * r1}
                      x2={50 + Math.cos(a) * r2}
                      y2={50 + Math.sin(a) * r2}
                      className="runner-mark"
                    />
                  );
                })}
              </svg>
              <span className="runner-icon" aria-hidden="true">
                {running ? (
                  <svg viewBox="0 0 24 24" width="22" height="22">
                    <rect x="6"  y="4" width="4" height="16" rx="0.5" fill="currentColor"/>
                    <rect x="14" y="4" width="4" height="16" rx="0.5" fill="currentColor"/>
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" width="22" height="22">
                    <path d="M7 4 L20 12 L7 20 Z" fill="currentColor"/>
                  </svg>
                )}
              </span>
              <span className="runner-label">{running ? 'PAUSA' : 'INICIAR'}</span>
            </button>
            <button className="console-reset" onClick={onReset} title="Reiniciar">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 12a9 9 0 1 0 3-6.7" />
                <path d="M3 4v6h6" />
              </svg>
              REINICIAR
            </button>
          </div>

          <Dial
            label="Velocidad"
            value={velocity}
            min={velocityRange[0]}
            max={velocityRange[1]}
            step={0.05}
            unit="u/s"
            decimals={2}
            size="md"
            variant="cyan"
            onChange={onVelocityChange}
          />
          <Dial
            label="Tiempo"
            value={simSpeed}
            min={0.1}
            max={3}
            step={0.05}
            unit="×"
            decimals={2}
            size="md"
            variant="stable"
            onChange={onSpeedChange}
          />
        </div>
      </div>
    </div>
  );
}
