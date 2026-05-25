/* ============================================================
   Dial · ERIS
   Control circular científico. Drag vertical o lateral para
   cambiar el valor. Muestra arco, dígitos y anillo de halo.
   ============================================================ */

import { useRef, useState, useCallback } from 'react';
import './Dial.css';

export default function Dial({
  label,
  value,
  min = 0,
  max = 100,
  step = 1,
  unit = '',
  decimals,
  size = 'md',           // sm · md · lg
  variant = 'cyan',      // cyan · amber · stable · neutral
  showArc = true,
  format,                // optional custom value formatter
  onChange,
  disabled = false,
}) {
  const svgRef = useRef(null);
  const dragState = useRef(null);
  const [active, setActive] = useState(false);

  const dec = decimals ?? (step < 1 ? 2 : 0);
  const pct = Math.max(0, Math.min(1, (value - min) / (max - min)));

  // ---- arco SVG ----
  const R = 42;
  const C = 2 * Math.PI * R;
  // arco de 270°  (-135° a +135°)
  const arcLen = (270 / 360) * C;
  const dashFill = arcLen * pct;
  const dashRest = C - dashFill;

  // ---- pointer drag (vertical = principal) ----
  const handleDown = useCallback((e) => {
    if (disabled) return;
    const point = e.touches ? e.touches[0] : e;
    dragState.current = {
      startY: point.clientY,
      startX: point.clientX,
      startValue: value,
    };
    setActive(true);
    e.preventDefault();
    e.stopPropagation();
  }, [value, disabled]);

  const handleMove = useCallback((e) => {
    if (!dragState.current) return;
    const point = e.touches ? e.touches[0] : e;
    const dy = dragState.current.startY - point.clientY;     // arriba = +
    const dx = point.clientX - dragState.current.startX;     // derecha = +
    // Combinación: dy es más fuerte, dx aporta poco.
    const delta = (dy * 1.2 + dx * 0.4) / 180;               // 180px = recorrido completo
    const range = max - min;
    let next = dragState.current.startValue + delta * range;
    next = Math.round(next / step) * step;
    next = Math.max(min, Math.min(max, next));
    if (onChange) onChange(next);
  }, [min, max, step, onChange]);

  const handleUp = useCallback(() => {
    dragState.current = null;
    setActive(false);
  }, []);

  // ---- listeners globales mientras arrastra ----
  const onPointerDown = (e) => {
    handleDown(e);
    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', endDrag);
    window.addEventListener('touchmove', handleMove, { passive: false });
    window.addEventListener('touchend', endDrag);
  };
  function endDrag() {
    handleUp();
    window.removeEventListener('mousemove', handleMove);
    window.removeEventListener('mouseup', endDrag);
    window.removeEventListener('touchmove', handleMove);
    window.removeEventListener('touchend', endDrag);
  }

  // ---- scroll wheel (gesto natural) ----
  const onWheel = (e) => {
    if (disabled) return;
    e.preventDefault();
    const range = max - min;
    const dir = e.deltaY < 0 ? 1 : -1;
    let next = value + dir * step * Math.max(1, Math.abs(e.deltaY) / 60);
    next = Math.round(next / step) * step;
    next = Math.max(min, Math.min(max, next));
    onChange?.(next);
  };

  // ---- doble-click reset al centro ----
  const onDouble = () => {
    if (disabled) return;
    const mid = min + (max - min) / 2;
    onChange?.(Math.round(mid / step) * step);
  };

  const displayValue = format
    ? format(value)
    : Number(value).toFixed(dec);

  return (
    <div className={`dial dial-${size} dial-${variant} ${active ? 'is-active' : ''} ${disabled ? 'is-disabled' : ''}`}>
      <span className="dial-label">{label}</span>

      <div
        className="dial-wrap"
        onMouseDown={onPointerDown}
        onTouchStart={onPointerDown}
        onWheel={onWheel}
        onDoubleClick={onDouble}
        title="Arrastra · scroll · doble-clic para centrar"
      >
        <svg ref={svgRef} viewBox="0 0 100 100" className="dial-svg">
          {/* Anillo base */}
          <circle
            cx="50" cy="50" r={R}
            className="dial-track"
            fill="none"
            strokeWidth="1.2"
            strokeDasharray={`${arcLen} ${C}`}
            transform="rotate(135 50 50)"
          />
          {/* Arco lleno */}
          {showArc && (
            <circle
              cx="50" cy="50" r={R}
              className="dial-fill"
              fill="none"
              strokeWidth="2"
              strokeDasharray={`${dashFill} ${dashRest + (C - arcLen)}`}
              transform="rotate(135 50 50)"
              strokeLinecap="round"
            />
          )}
          {/* Marcas */}
          {Array.from({ length: 13 }).map((_, i) => {
            const a = (135 + (270 / 12) * i) * Math.PI / 180;
            const big = i % 3 === 0;
            const r1 = R - 4;
            const r2 = big ? R - 9 : R - 6.5;
            const x1 = 50 + Math.cos(a) * r1;
            const y1 = 50 + Math.sin(a) * r1;
            const x2 = 50 + Math.cos(a) * r2;
            const y2 = 50 + Math.sin(a) * r2;
            return (
              <line
                key={i}
                x1={x1} y1={y1} x2={x2} y2={y2}
                className={`dial-tick ${big ? 'big' : ''}`}
                strokeWidth={big ? 1.1 : 0.6}
              />
            );
          })}
          {/* Indicador */}
          {(() => {
            const a = (135 + 270 * pct) * Math.PI / 180;
            const x = 50 + Math.cos(a) * R;
            const y = 50 + Math.sin(a) * R;
            return (
              <g className="dial-knob">
                <circle cx={x} cy={y} r="3" className="dial-knob-dot" />
                <circle cx={x} cy={y} r="6" className="dial-knob-halo" />
              </g>
            );
          })()}
          {/* Inner core */}
          <circle cx="50" cy="50" r="22" className="dial-core" />
        </svg>

        <div className="dial-readout">
          <span className="dial-value">{displayValue}</span>
          {unit && <span className="dial-unit">{unit}</span>}
        </div>
      </div>
    </div>
  );
}
