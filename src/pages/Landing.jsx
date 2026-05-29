/* ============================================================
   ERIS · Landing
   Inmersión: oscuridad → ventanal orbital → texto → acción.
   ============================================================ */

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SpaceBackground from '../scenes/SpaceBackground.jsx';
import HoloButton from '../components/HoloButton.jsx';
import '../styles/landing.css';

export default function Landing() {
  const nav = useNavigate();
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 600);
    const t2 = setTimeout(() => setPhase(2), 2000);
    const t3 = setTimeout(() => setPhase(3), 3800);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  return (
    <div className={`landing full-screen vignette aberration phase-${phase}`}>
      <div className="landing-space">
        <SpaceBackground />
      </div>

      <div className="landing-veil" />

      <div className="viewport" aria-hidden="true">
        <div className="viewport-ring viewport-ring-outer" />
        <div className="viewport-ring viewport-ring-mid" />
        <div className="viewport-ring viewport-ring-inner" />
        <div className="viewport-glass" />
        <div className="viewport-reflection" />
        <div className="viewport-ticks">
          {Array.from({ length: 48 }).map((_, i) => (
            <span key={i} style={{ transform: `rotate(${(i * 360) / 48}deg)` }} />
          ))}
        </div>

        <div className="viewport-content">
          <h1 className="landing-title">ERIS</h1>
          <p className="landing-station">ORBITAL RESEARCH STATION</p>
          <span className="viewport-divider" />
          <p className="landing-mantra">EXPLORA · EXPERIMENTA · COMPRENDE</p>
        </div>

        <div className="viewport-coords">
          <span className="vp-coord vp-n">N · 00°00′</span>
          <span className="vp-coord vp-e">E · 00°00′</span>
          <span className="vp-coord vp-s">S · 00°00′</span>
          <span className="vp-coord vp-w">W · 00°00′</span>
        </div>
      </div>

      <div className="landing-overlay">
        <div className="landing-topbar">
          <span className="brand">
            <span className="brand-dot breathe" />
            <span className="brand-name">ERIS</span>
            <span className="brand-sep">·</span>
            <span className="brand-version">OBSERVATORIO GRAVITACIONAL</span>
          </span>
          <span className="topbar-meta">
            <span className="label-quiet">SECTOR 0 · LAT 0°00′ · LON 0°00′</span>
          </span>
        </div>

        <div className="landing-action">
          <p className="landing-tag">Explora la geometría del universo</p>
          <HoloButton size="lg" onClick={() => nav('/hub')}>
            Iniciar misión
          </HoloButton>
          <button className="landing-skip" onClick={() => nav('/simulation/gravity-01')}>
            Saltar al observatorio →
          </button>
          <p className="landing-footnote">
            Recomendado · audífonos · ambiente silencioso
          </p>
        </div>

        <div className="landing-bottombar">
          <span className="label-quiet">ESTADO · NOMINAL</span>
          <span className="bot-sep" />
          <span className="label-quiet">TRIPULACIÓN · 1</span>
          <span className="bot-sep" />
          <span className="label-quiet">PRESIÓN · 101.3 kPa</span>
          <span className="bot-sep" />
          <span className="label-quiet">T-MINUS · 00:00</span>
          <span className="bot-sep" />
          <span className="label-quiet"><span className="bot-dot" /> SISTEMAS EN LÍNEA</span>
        </div>

        <span className="hud-corner tl" />
        <span className="hud-corner tr" />
        <span className="hud-corner bl" />
        <span className="hud-corner br" />
      </div>
    </div>
  );
}
