/* ============================================================
   ERIS · Simulación
   Observatorio gravitacional. Canvas 3D fullscreen.
   Consola flotante inferior · Sidebar izquierda · Quiz emergente.
   ============================================================ */

import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getMission } from '../data/missions.js';
import GravityScene from '../scenes/GravityScene.jsx';
import ControlConsole from '../components/ControlConsole.jsx';
import SideNav from '../components/SideNav.jsx';
import ExperimentQuiz from '../components/ExperimentQuiz.jsx';
import { useGravitySim } from '../hooks/useGravitySim.js';
import { useMissionProgress } from '../hooks/useMissionProgress.jsx';
import * as THREE from 'three';
import '../styles/simulation.css';

export default function Simulation() {
  const { missionId } = useParams();
  const nav = useNavigate();
  const mission = useMemo(() => getMission(missionId), [missionId]);
  const { completeMission } = useMissionProgress();

  const sim = useGravitySim(mission.bodies);
  const { bodiesRef, trailsRef, tick, reset, setMass, setVelocityMagnitude } = sim;

  const [running, setRunning] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [navMode, setNavMode] = useState('cursor');
  const [tick0] = useState(Date.now());
  const [, force] = useState(0);
  const [quizOpen, setQuizOpen] = useState(false);
  const [quizDone, setQuizDone] = useState(false);

  // Re-render ligero ~8fps para refrescar valores de UI
  useEffect(() => {
    const id = setInterval(() => force((n) => n + 1), 130);
    return () => clearInterval(id);
  }, []);

  // Cambio de misión = reset completo
  useEffect(() => {
    reset();
    setRunning(false);
    setQuizOpen(false);
    setQuizDone(false);
  }, [mission.id, reset]);

  // Cuerpos primarios
  const central = bodiesRef.current.find((b) => b.fixed) ?? bodiesRef.current[0];
  const probe = bodiesRef.current.find((b) => !b.fixed && b.id !== central.id) ?? bodiesRef.current[1];

  // Distancia probe ↔ central
  const distance = useMemo(() => {
    if (!central || !probe) return 0;
    const dx = probe.position.x - central.position.x;
    const dy = probe.position.y - central.position.y;
    const dz = probe.position.z - central.position.z;
    return Math.sqrt(dx*dx + dy*dy + dz*dz);
  }, [central, probe, force]); // eslint-disable-line

  function setDistance(d) {
    if (!central || !probe) return;
    const dir = new THREE.Vector3().subVectors(probe.position, central.position);
    if (dir.lengthSq() < 1e-6) dir.set(1, 0, 0);
    dir.normalize().multiplyScalar(d);
    probe.position.copy(central.position).add(dir);
    // Resetear estela
    trailsRef.current[bodiesRef.current.indexOf(probe)] = [];
  }

  const elapsed = Math.floor((Date.now() - tick0) / 1000);
  const elapsedLabel = `${String(Math.floor(elapsed / 60)).padStart(2, '0')}:${String(elapsed % 60).padStart(2, '0')}`;

  function handleComplete() {
    completeMission(mission.id, mission.discovery);
    nav(`/debrief/${mission.id}`);
  }

  // Quiz real definido en missions.js (A/B/C con respuestas correctas)
  const quizQuestions = mission.quiz ?? [];

  return (
    <div className="sim full-screen">
      <GravityScene
        bodiesRef={bodiesRef}
        trailsRef={trailsRef}
        tick={tick}
        running={running}
        speed={speed}
        showGrid
      />

      {/* HUD superior */}
      <div className="sim-hud-top">
        <div className="sim-mission">
          <span className="label">{mission.codename}</span>
          <h2>{mission.title}</h2>
          <p>{mission.subtitle}</p>
        </div>
        <div className="sim-meta">
          <div className="meta-item">
            <span className="label-quiet">T+</span>
            <span className="meta-value">{elapsedLabel}</span>
          </div>
          <div className="meta-item">
            <span className="label-quiet">CUERPOS</span>
            <span className="meta-value">{bodiesRef.current.length}</span>
          </div>
          <button className="hub-exit" onClick={() => nav('/hub')}>← HUB</button>
        </div>
      </div>

      {/* Sidebar izquierda */}
      <SideNav active={navMode} onSelect={setNavMode} />

      {/* Pista contextual minimal — sustituye al asistente IA */}
      <aside className="sim-hint">
        <span className="hint-label">OBJETIVO</span>
        <p>{mission.objective}</p>
        {!quizDone && (
          <button className="hint-cta" onClick={() => setQuizOpen(true)}>
            Comprobar observación →
          </button>
        )}
        {quizDone && (
          <button className="hint-cta" onClick={handleComplete}>
            Cerrar bitácora →
          </button>
        )}
      </aside>

      {/* Consola flotante inferior */}
      <ControlConsole
        mass={central?.mass ?? 60}
        distance={distance}
        velocity={probe?.velocity.length() ?? 0}
        simSpeed={speed}
        running={running}
        massRange={[5, 200]}
        distanceRange={[3, 14]}
        velocityRange={[0, 8]}
        onMassChange={(v) => central && setMass(central.id, v)}
        onDistanceChange={setDistance}
        onVelocityChange={(v) => probe && setVelocityMagnitude(probe.id, v)}
        onSpeedChange={setSpeed}
        onToggleRun={() => setRunning((r) => !r)}
        onReset={() => { reset(); setRunning(false); }}
        elapsedLabel={elapsedLabel}
      />

      {/* Quiz flotante */}
      {quizOpen && !quizDone && (
        <ExperimentQuiz
          questions={quizQuestions}
          onComplete={() => { setQuizOpen(false); setQuizDone(true); }}
          onClose={() => setQuizOpen(false)}
        />
      )}

      {/* Footer científico */}
      <div className="sim-footer">
        <span className="label-quiet">F = G · m₁ · m₂ / r²</span>
        <span className="label-quiet">DRAG · SCROLL · DOBLE-CLIC EN DIALES</span>
      </div>
    </div>
  );
}
