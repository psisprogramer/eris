/* ============================================================
   ERIS · Misiones científicas
   No son niveles. Son tareas de una tripulación espacial.
   Cada misión define un escenario inicial de cuerpos.
   ============================================================ */

export const missions = [
  {
    id: 'gravity-01',
    codename: 'KEPLER-01',
    title: 'El primer pozo',
    subtitle: 'Observa cómo una masa deforma el espacio.',
    objective:
      'Aumenta la masa del cuerpo central y observa cómo cambia la geometría a su alrededor.',
    hint:
      'No tengas miedo de exagerar la masa. La geometría revela su forma cuando la empujas.',
    discovery:
      'Las masas no atraen objetos: curvan el espacio en el que se mueven. Los demás cuerpos sólo siguen esa curvatura.',
    bodies: [
      { id: 'star',  mass: 60, position: [0, 0, 0],   velocity: [0, 0, 0], color: '#FFB36B', radius: 1.4, fixed: true, label: 'Estrella' },
      { id: 'probe', mass: 1,  position: [6, 0, 0],   velocity: [0, 0, 2.6], color: '#7DE2FC', radius: 0.35, label: 'Sonda' },
    ],
    focus: 'mass',
    questions: [
      '¿Qué pasa con la trayectoria de la sonda si aumentas la masa de la estrella?',
      '¿Por qué crees que el espacio se ve hundido bajo los cuerpos masivos?',
    ],
  },
  {
    id: 'orbit-02',
    codename: 'KEPLER-02',
    title: 'Estabiliza la órbita',
    subtitle: 'Encuentra el equilibrio entre velocidad y gravedad.',
    objective:
      'Modifica la velocidad inicial de la sonda para que complete una órbita estable.',
    hint:
      'Muy poca velocidad: cae. Demasiada: escapa. Hay un punto justo entre los dos.',
    discovery:
      'Una órbita no es una caída fallida ni una huida fallida. Es el equilibrio exacto entre ambas.',
    bodies: [
      { id: 'planet', mass: 80, position: [0, 0, 0], velocity: [0, 0, 0], color: '#B8D8FF', radius: 1.6, fixed: true, label: 'Planeta' },
      { id: 'probe',  mass: 1,  position: [7, 0, 0], velocity: [0, 0, 3.3], color: '#7DE2FC', radius: 0.3, label: 'Sonda' },
    ],
    focus: 'velocity',
    questions: [
      '¿La órbita más rápida es siempre la más estable?',
      '¿Qué relación hay entre la distancia y la velocidad necesaria para orbitar?',
    ],
  },
  {
    id: 'binary-03',
    codename: 'KEPLER-03',
    title: 'Sistema binario',
    subtitle: 'Dos masas se danzan mutuamente.',
    objective:
      'Observa cómo dos estrellas similares se mueven alrededor de un centro común.',
    hint:
      'Si las dos masas son iguales, ninguna queda quieta. Ambas orbitan el punto medio.',
    discovery:
      'En el universo, casi nada está realmente quieto: todo orbita su centro de masa común.',
    bodies: [
      { id: 'a', mass: 40, position: [-3, 0, 0], velocity: [0, 0,  2.3], color: '#FFB36B', radius: 1.1, label: 'Estrella A' },
      { id: 'b', mass: 40, position: [ 3, 0, 0], velocity: [0, 0, -2.3], color: '#FF8A4C', radius: 1.1, label: 'Estrella B' },
      { id: 'probe', mass: 0.5, position: [0, 0, 8], velocity: [3.0, 0, 0], color: '#7DE2FC', radius: 0.25, label: 'Sonda' },
    ],
    focus: 'free',
    questions: [
      '¿Hacia dónde "cae" la sonda al pasar entre las dos estrellas?',
      '¿Qué cambia si una estrella es mucho más masiva que la otra?',
    ],
  },
];

export function getMission(id) {
  return missions.find((m) => m.id === id) ?? missions[0];
}
