/* ============================================================
   ERIS · Estado de progreso de la tripulación
   Context API ligero — sin librerías externas.
   ============================================================ */

import { createContext, useContext, useMemo, useState, useCallback } from 'react';

const MissionContext = createContext(null);

export function MissionProvider({ children }) {
  const [completed, setCompleted] = useState({});      // { missionId: true }
  const [discoveries, setDiscoveries] = useState([]);  // [{ missionId, text, timestamp }]
  const [logs, setLogs] = useState([]);                // bitácora libre del usuario

  const completeMission = useCallback((missionId, discoveryText) => {
    setCompleted((prev) => ({ ...prev, [missionId]: true }));
    if (discoveryText) {
      setDiscoveries((prev) => [
        ...prev,
        { missionId, text: discoveryText, timestamp: Date.now() },
      ]);
    }
  }, []);

  const addLog = useCallback((missionId, text) => {
    if (!text?.trim()) return;
    setLogs((prev) => [
      ...prev,
      { missionId, text: text.trim(), timestamp: Date.now() },
    ]);
  }, []);

  const value = useMemo(
    () => ({ completed, discoveries, logs, completeMission, addLog }),
    [completed, discoveries, logs, completeMission, addLog]
  );

  return <MissionContext.Provider value={value}>{children}</MissionContext.Provider>;
}

export function useMissionProgress() {
  const ctx = useContext(MissionContext);
  if (!ctx) throw new Error('useMissionProgress requiere <MissionProvider>');
  return ctx;
}
