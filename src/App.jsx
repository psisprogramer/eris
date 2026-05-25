import { Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing.jsx';
import Hub from './pages/Hub.jsx';
import Simulation from './pages/Simulation.jsx';
import Debrief from './pages/Debrief.jsx';
import { MissionProvider } from './hooks/useMissionProgress.jsx';

export default function App() {
  return (
    <MissionProvider>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/hub" element={<Hub />} />
        <Route path="/simulation/:missionId" element={<Simulation />} />
        <Route path="/simulation" element={<Simulation />} />
        <Route path="/debrief/:missionId" element={<Debrief />} />
        <Route path="/debrief" element={<Debrief />} />
      </Routes>
    </MissionProvider>
  );
}
