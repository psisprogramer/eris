/* ============================================================
   ERIS · Landing — Observatorio Orbital Cinematográfico
   El usuario debe sentirse DENTRO de la estación.
   ============================================================ */

import { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/landing.css';

/* ── Canvas Space Scene ─────────────────────────────────── */
function useSpaceCanvas(canvasRef) {
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let W, H, stars = [], raf;

    function resize() {
      W = canvas.width  = canvas.offsetWidth;
      H = canvas.height = canvas.offsetHeight;
      buildStars();
    }

    function buildStars() {
      stars = [];
      const count = Math.min(700, Math.floor(W * H / 2200));
      for (let i = 0; i < count; i++) {
        const r = Math.random();
        const col = r < 0.76 ? [255,255,255] : r < 0.89 ? [200,218,255] : [255,240,208];
        stars.push({
          x: Math.random() * W,
          y: Math.random() * H * 0.80,
          sz: Math.pow(Math.random(), 2.6) * 2.3 + 0.22,
          base: Math.random() * 0.52 + 0.28,
          spd: Math.random() * 0.014 + 0.004,
          ph: Math.random() * Math.PI * 2,
          col,
        });
      }
    }

    function drawNebula() {
      // Two faint gas clouds
      const n1 = ctx.createRadialGradient(W*0.18, H*0.25, 0, W*0.18, H*0.25, W*0.36);
      n1.addColorStop(0, 'rgba(28,50,92,0.048)');
      n1.addColorStop(1, 'rgba(28,50,92,0)');
      ctx.fillStyle = n1;
      ctx.fillRect(0, 0, W, H);

      const n2 = ctx.createRadialGradient(W*0.82, H*0.14, 0, W*0.82, H*0.14, W*0.28);
      n2.addColorStop(0, 'rgba(55,28,80,0.032)');
      n2.addColorStop(1, 'rgba(55,28,80,0)');
      ctx.fillStyle = n2;
      ctx.fillRect(0, 0, W, H);
    }

    function drawPlanet() {
      // Planet center: far below viewport so we see only the curved horizon rim
      const px = W * 0.50;
      const py = H * 1.22;
      const pr = H * 0.93;

      // Atmospheric haze layers
      for (let i = 8; i >= 1; i--) {
        const ar = pr + i * 12;
        const ag = ctx.createRadialGradient(px, py, pr * 0.88, px, py, ar);
        ag.addColorStop(0, `rgba(125,226,252,${0.048 / i * 1.6})`);
        ag.addColorStop(1, 'rgba(125,226,252,0)');
        ctx.beginPath();
        ctx.arc(px, py, ar, 0, Math.PI*2);
        ctx.fillStyle = ag;
        ctx.fill();
      }

      // Dark planet body with subtle lit face
      const bg = ctx.createRadialGradient(
        px - pr*0.30, py - pr*0.34, 0,
        px, py, pr
      );
      bg.addColorStop(0,    '#1c2540');
      bg.addColorStop(0.22, '#101828');
      bg.addColorStop(0.55, '#090d18');
      bg.addColorStop(0.85, '#060810');
      bg.addColorStop(1,    '#040609');
      ctx.beginPath();
      ctx.arc(px, py, pr, 0, Math.PI*2);
      ctx.fillStyle = bg;
      ctx.fill();

      // Cloud bands inside planet
      ctx.save();
      ctx.beginPath();
      ctx.arc(px, py, pr, 0, Math.PI*2);
      ctx.clip();

      [0.16, 0.33, 0.50, 0.66, 0.82].forEach((frac, i) => {
        const by = py - pr + frac * pr * 2;
        const bh = 28 + Math.sin(i * 2.1) * 10;
        const cg = ctx.createLinearGradient(px - pr, by - bh, px + pr, by + bh);
        cg.addColorStop(0, 'rgba(22,38,62,0)');
        cg.addColorStop(0.4, `rgba(18,32,52,${0.055 + i*0.005})`);
        cg.addColorStop(0.6, `rgba(24,42,68,0.044)`);
        cg.addColorStop(1, 'rgba(22,38,62,0)');
        ctx.fillStyle = cg;
        ctx.fillRect(px - pr, by - bh, pr*2, bh*2);
      });

      // Subtle specular reflection on lit face
      const sg = ctx.createLinearGradient(
        px - pr*0.75, py - pr*0.75,
        px + pr*0.25, py + pr*0.25
      );
      sg.addColorStop(0, 'rgba(125,226,252,0.048)');
      sg.addColorStop(0.4, 'rgba(125,226,252,0)');
      ctx.fillStyle = sg;
      ctx.fillRect(px - pr, py - pr, pr*2, pr*2);
      ctx.restore();

      // Atmospheric rim highlight (cyan edge)
      const rim = ctx.createRadialGradient(px, py, pr - 2, px, py, pr + 14);
      rim.addColorStop(0, 'rgba(125,226,252,0)');
      rim.addColorStop(0.5, 'rgba(125,226,252,0.28)');
      rim.addColorStop(1, 'rgba(125,226,252,0)');
      ctx.beginPath();
      ctx.arc(px, py, pr + 7, 0, Math.PI*2);
      ctx.fillStyle = rim;
      ctx.fill();
    }

    function drawBeam(t) {
      const by = H * 0.648;
      const breath = Math.sin(t * 0.00026) * 0.16 + 1.0;

      // Wide volumetric haze
      const hg = ctx.createLinearGradient(0, by-58, 0, by+58);
      hg.addColorStop(0,    'rgba(255,138,76,0)');
      hg.addColorStop(0.3,  `rgba(255,138,76,${0.038 * breath})`);
      hg.addColorStop(0.5,  `rgba(255,196,114,${0.062 * breath})`);
      hg.addColorStop(0.7,  `rgba(255,138,76,${0.038 * breath})`);
      hg.addColorStop(1,    'rgba(255,138,76,0)');
      ctx.fillStyle = hg;
      ctx.fillRect(0, by-58, W, 116);

      // Bright core
      const cg = ctx.createLinearGradient(0, by-3, 0, by+3);
      cg.addColorStop(0, 'rgba(255,228,168,0)');
      cg.addColorStop(0.5, `rgba(255,228,168,${0.13 * breath})`);
      cg.addColorStop(1, 'rgba(255,228,168,0)');
      ctx.fillStyle = cg;
      ctx.fillRect(0, by-3, W, 6);

      // Floating beam particles
      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      for (let p = 0; p < 30; p++) {
        const bx = ((Math.sin(p * 137.508 + t * 0.00014) * 0.5 + 0.5)) * W;
        const bpy = by + Math.sin(p * 83.21 + t * 0.00019) * 26;
        const bsz = 0.8 + Math.sin(p * 17.3) * 0.5;
        const bop = 0.022 * breath * (0.5 + Math.sin(p*2.1 + t*0.0003)*0.5);
        ctx.beginPath();
        ctx.arc(bx, bpy, bsz, 0, Math.PI*2);
        ctx.fillStyle = `rgba(255,198,140,${bop})`;
        ctx.fill();
      }
      ctx.restore();
    }

    function render(ts) {
      ctx.fillStyle = '#05070A';
      ctx.fillRect(0, 0, W, H);

      drawNebula();

      // Stars with twinkle and diffraction
      stars.forEach(s => {
        const tw = Math.sin(ts * s.spd + s.ph);
        const op = Math.max(0, Math.min(1, s.base + tw * 0.15));
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.sz, 0, Math.PI*2);
        ctx.fillStyle = `rgba(${s.col[0]},${s.col[1]},${s.col[2]},${op})`;
        ctx.fill();

        if (s.sz > 1.3 && op > 0.6) {
          ctx.save();
          ctx.globalAlpha = op * 0.12;
          ctx.strokeStyle = `rgba(${s.col[0]},${s.col[1]},${s.col[2]},1)`;
          ctx.lineWidth = 0.35;
          const r = s.sz * 2.8;
          ctx.beginPath(); ctx.moveTo(s.x-r, s.y); ctx.lineTo(s.x+r, s.y); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(s.x, s.y-r); ctx.lineTo(s.x, s.y+r); ctx.stroke();
          ctx.restore();
        }
      });

      drawBeam(ts);
      drawPlanet();

      raf = requestAnimationFrame(render);
    }

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    resize();
    raf = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [canvasRef]);
}

/* ── Mouse Parallax ─────────────────────────────────────── */
function useParallax(wrapperRef) {
  const mouseRef = useRef({ x: 0, y: 0 });
  const targetRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    function onMove(e) {
      mouseRef.current.x = (e.clientX / window.innerWidth  - 0.5) * 2;
      mouseRef.current.y = (e.clientY / window.innerHeight - 0.5) * 2;
    }
    document.addEventListener('mousemove', onMove);

    let raf;
    function tick() {
      const m = mouseRef.current;
      const t = targetRef.current;
      t.x += (m.x - t.x) * 0.036;
      t.y += (m.y - t.y) * 0.036;

      const canvas = wrapper.querySelector('.lnd-canvas');
      const frame  = wrapper.querySelector('.win-scene');
      const brand  = wrapper.querySelector('.lnd-brand');
      const huds   = wrapper.querySelectorAll('.lnd-hud');
      const cta    = wrapper.querySelector('.lnd-cta-wrap');

      if (canvas) canvas.style.transform = `translate(${t.x * -5}px, ${t.y * -5}px) scale(1.05)`;
      if (frame)  frame.style.transform  = `translate(${t.x * -3.5}px, ${t.y * -3.5}px)`;
      if (brand)  brand.style.transform  = `translate(${t.x * -2}px, ${t.y * -2}px)`;
      if (cta)    cta.style.transform    = `translateX(-50%) translate(${t.x * -1.5}px, ${t.y * -1.5}px)`;

      huds.forEach((h, i) => {
        const s = i % 2 === 0 ? 1 : -1;
        h.style.transform = `translate(${t.x * s * 2.2}px, ${t.y * s * 2.2}px)`;
      });

      raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);

    return () => {
      document.removeEventListener('mousemove', onMove);
      cancelAnimationFrame(raf);
    };
  }, [wrapperRef]);
}

/* ── Live Telemetry ─────────────────────────────────────── */
function useLiveTelemetry() {
  const [tele, setTele] = useState({
    lat: '+23.7841', lon: '−147.2290', alt: '421.8',
    grav: '9.7832', gVar: '±0.0003',
    freq: '0.0031', snr: '34.7', buf: '84.2',
    utc: '--:--:--',
  });

  useEffect(() => {
    function jitter(v, r, d) { return (v + (Math.random()-0.5)*r).toFixed(d); }
    const clk = setInterval(() => {
      const now = new Date();
      const pad = n => String(n).padStart(2,'0');
      setTele(prev => ({
        ...prev,
        alt:  jitter(421.8,  0.05, 1),
        grav: jitter(9.7832, 0.0010, 4),
        freq: jitter(0.0031, 0.0003, 4),
        utc:  `${pad(now.getUTCHours())}:${pad(now.getUTCMinutes())}:${pad(now.getUTCSeconds())}`,
      }));
    }, 2800);
    return () => clearInterval(clk);
  }, []);

  return tele;
}

/* ── Component ──────────────────────────────────────────── */
export default function Landing() {
  const nav     = useNavigate();
  const rootRef = useRef(null);
  const canvRef = useRef(null);
  const [phase, setPhase] = useState(0);
  const [ctaState, setCtaState] = useState('idle'); // idle | starting | active
  const [progress, setProgress] = useState(0);
  const tele = useLiveTelemetry();

  useSpaceCanvas(canvRef);
  useParallax(rootRef);

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 400);
    const t2 = setTimeout(() => setPhase(2), 1800);
    const t3 = setTimeout(() => setPhase(3), 3400);
    return () => [t1,t2,t3].forEach(clearTimeout);
  }, []);

  const handleCta = useCallback(() => {
    if (ctaState !== 'idle') { nav('/hub'); return; }
    setCtaState('starting');
    let p = 0;
    const iv = setInterval(() => {
      p += Math.random() * 3.8 + 0.8;
      if (p >= 100) { p = 100; clearInterval(iv); }
      setProgress(Math.round(p));
    }, 120);
    setTimeout(() => setCtaState('active'), 4000);
  }, [ctaState, nav]);

  return (
    <div ref={rootRef} className={`lnd full-screen phase-${phase}`}>
      {/* ── DEEP SPACE CANVAS ─── */}
      <canvas ref={canvRef} className="lnd-canvas" />

      {/* ── STATION INTERIOR ARCHITECTURE ─── */}
      <div className="stn-ceiling" aria-hidden="true" />
      <div className="stn-floor"   aria-hidden="true" />
      <div className="stn-wall-l"  aria-hidden="true" />
      <div className="stn-wall-r"  aria-hidden="true" />

      {/* ── WINDOW SCENE (frame + glass) ─── */}
      <div className="win-scene" aria-hidden="true">
        {/* Glass surface with reflections */}
        <div className="win-glass" />
        <div className="win-ao" />

        {/* Outer frame bars */}
        <div className="wf wf-top" />
        <div className="wf wf-bot" />
        <div className="wf wf-l"   />
        <div className="wf wf-r"   />

        {/* Corner joints */}
        <div className="wf-corner wf-corner-tl" />
        <div className="wf-corner wf-corner-tr" />
        <div className="wf-corner wf-corner-bl" />
        <div className="wf-corner wf-corner-br" />

        {/* Structural cross-bars */}
        <div className="wf-bar wf-bar-h" />
        <div className="wf-bar wf-bar-vl" />
        <div className="wf-bar wf-bar-vr" />

        {/* Corner bolts */}
        <div className="wf-bolt wf-bolt-tl" />
        <div className="wf-bolt wf-bolt-tr" />
        <div className="wf-bolt wf-bolt-bl" />
        <div className="wf-bolt wf-bolt-br" />

        {/* Structural detail lines on frame */}
        <div className="wf-detail wf-detail-top-l" />
        <div className="wf-detail wf-detail-top-r" />
        <div className="wf-detail wf-detail-bot-l" />
        <div className="wf-detail wf-detail-bot-r" />
      </div>

      {/* ── ATMOSPHERIC LIGHT EFFECTS ─── */}
      <div className="atm-cyan-ceil"  aria-hidden="true" />
      <div className="atm-warm-floor" aria-hidden="true" />
      <div className="atm-warm-l"     aria-hidden="true" />

      {/* ── BRANDING ─── */}
      <div className="lnd-brand">
        <h1 className="lnd-title">ERIS</h1>
        <p  className="lnd-sub">OBSERVATORIO GRAVITACIONAL <span className="lnd-sep">·</span> SECTOR Ω-7</p>
      </div>

      {/* ── HUD TELEMETRY PANELS ─── */}
      <div className="lnd-hud hud-tl">
        <p className="hud-label"><span className="hud-dot hud-dot--cyan" />Posición Orbital</p>
        <div className="hud-body">
          <div className="hud-row"><span className="hud-key">LAT</span><span className="hud-val hud-val--cyan">{tele.lat}°</span></div>
          <div className="hud-row"><span className="hud-key">LON</span><span className="hud-val hud-val--cyan">{tele.lon}°</span></div>
          <div className="hud-row"><span className="hud-key">ALT</span><span className="hud-val hud-val--cyan">{tele.alt} km</span></div>
        </div>
        <div className="hud-rule" />
        <p className="hud-meta">INC 51.64° · PERIODO 92.9 min</p>
      </div>

      <div className="lnd-hud hud-tr">
        <p className="hud-label"><span className="hud-dot hud-dot--cyan" />Campo Gravitacional</p>
        <div className="hud-big">{tele.grav}<span className="hud-big-unit">m/s²</span></div>
        <div className="hud-rule" />
        <div className="hud-body">
          <div className="hud-eq">G<sub>μν</sub> = R<sub>μν</sub> − ½g<sub>μν</sub>R</div>
          <div className="hud-eq">Λg<sub>μν</sub> = 8πG/c⁴ · T<sub>μν</sub></div>
        </div>
        <div className="hud-rule" />
        <p className="hud-meta">VARIACIÓN <span className="hud-val--cyan">{tele.gVar}</span></p>
      </div>

      <div className="lnd-hud hud-bl">
        <p className="hud-label"><span className="hud-dot hud-dot--cyan" />Diagnóstico</p>
        <div className="hud-body">
          <div className="hud-row"><span className="hud-key">SENSORES</span><span className="hud-val hud-val--cyan">ACTIVO</span></div>
          <div className="hud-row"><span className="hud-key">ESPECTRÓMETRO</span><span className="hud-val hud-val--cyan">OK</span></div>
          <div className="hud-row"><span className="hud-key">INTERFRÓMETRO</span><span className="hud-val hud-val--cyan">LISTO</span></div>
          <div className="hud-row"><span className="hud-key">PROCESADOR Q</span><span className="hud-val hud-val--warm">CARGANDO</span></div>
        </div>
        <div className="hud-rule" />
        <p className="hud-meta">INTEGRIDAD <span className="hud-val--cyan">99.7%</span></p>
      </div>

      <div className="lnd-hud hud-br">
        <p className="hud-label"><span className="hud-dot hud-dot--warm" />Ondas Gravitacionales</p>
        <div className="hud-big">{tele.freq}<span className="hud-big-unit">Hz</span></div>
        <div className="hud-rule" />
        <div className="hud-body">
          <div className="hud-row"><span className="hud-key">SEÑAL</span><span className="hud-val hud-val--warm">PROCESANDO</span></div>
          <div className="hud-row"><span className="hud-key">SNR</span><span className="hud-val hud-val--cyan">{tele.snr} dB</span></div>
          <div className="hud-row"><span className="hud-key">BUFFER</span><span className="hud-val hud-val--cyan">{tele.buf} TB</span></div>
        </div>
      </div>

      {/* ── MAIN CTA ─── */}
      <div className="lnd-cta-wrap">
        <div className={`lnd-cta-card cta-state-${ctaState}`}>
          <p className="cta-sys-label">
            <span className="cta-line" />
            Módulo de Calibración Activo
            <span className="cta-line" />
          </p>
          <button
            className="cta-btn"
            onClick={handleCta}
            aria-label="Iniciar calibración gravitacional"
          >
            {ctaState === 'idle'     ? 'Iniciar Calibración Gravitacional' :
             ctaState === 'starting' ? 'Iniciando secuencia...' :
             'Sistema Activo · Continuar →'}
          </button>
          <div className="cta-progress-row">
            <div className="cta-progress-track">
              <div
                className="cta-progress-fill"
                style={{
                  width: ctaState === 'idle' ? undefined : `${progress}%`,
                  animation: ctaState === 'idle' ? 'ctaProgressIdle 4.5s ease-in-out infinite' : 'none',
                }}
              />
            </div>
            <span className="cta-status-text">
              {ctaState === 'idle'     ? 'Sistemas nominales' :
               ctaState === 'starting' ? `Calibrando... ${progress}%` :
               'Calibración completa'}
            </span>
          </div>
        </div>
        {phase >= 3 && (
          <button className="cta-skip" onClick={() => nav('/simulation/gravity-01')}>
            Saltar al observatorio →
          </button>
        )}
      </div>

      {/* ── BOTTOM TICKER ─── */}
      <div className="lnd-ticker" aria-hidden="true">
        <div className="lnd-ticker-inner">
          {[
            ['UTC', tele.utc],
            ['VELOCIDAD ORBITAL', '7.66 km/s'],
            ['PRESIÓN', '101.3 kPa'],
            ['TEMP EXTERIOR', '−270.2 °C'],
            ['RADIACIÓN SOLAR', '1,361 W/m²'],
            ['CAMPO MAGNÉTICO', '0.42 μT'],
            ['PROTOCOLO', 'ERIS v4.2.1'],
            ['ESTADO', 'NOMINAL'],
            ['UTC', tele.utc],
            ['VELOCIDAD ORBITAL', '7.66 km/s'],
            ['PRESIÓN', '101.3 kPa'],
            ['TEMP EXTERIOR', '−270.2 °C'],
            ['RADIACIÓN SOLAR', '1,361 W/m²'],
            ['CAMPO MAGNÉTICO', '0.42 μT'],
            ['PROTOCOLO', 'ERIS v4.2.1'],
            ['ESTADO', 'NOMINAL'],
          ].map(([k, v], i) => (
            <span key={i} className="lnd-ticker-item">
              {k} <span className="lnd-ticker-val">{v}</span>
            </span>
          ))}
        </div>
      </div>

      {/* ── CINEMATIC OVERLAYS ─── */}
      <div className="lnd-vignette"  aria-hidden="true" />
      <div className="lnd-scanlines" aria-hidden="true" />
    </div>
  );
}
