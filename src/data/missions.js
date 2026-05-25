/* ============================================================
   ERIS · Misiones cientificas
   ============================================================ */

export const missions = [
  {
    id: 'gravity-01',
    codename: 'KEPLER-01',
    title: 'El primer pozo',
    subtitle: 'Observa como una masa deforma el espacio.',
    objective: 'Aumenta la masa del cuerpo central y observa como cambia la geometria a su alrededor.',
    hint: 'No tengas miedo de exagerar la masa. La geometria revela su forma cuando la empujas.',
    discovery: 'Las masas no atraen objetos: curvan el espacio en el que se mueven. Los demas cuerpos solo siguen esa curvatura.',
    bodies: [
      { id: 'star',  mass: 60, position: [0, 0, 0], velocity: [0, 0, 0],   color: '#FFB36B', radius: 1.4,  fixed: true, label: 'Estrella' },
      { id: 'probe', mass: 1,  position: [6, 0, 0], velocity: [0, 0, 2.6], color: '#7DE2FC', radius: 0.35, label: 'Sonda' },
    ],
    focus: 'mass',
    quiz: [
      {
        q: 'Que ocurre con el espacio cuando aumenta la masa del cuerpo central?',
        options: [
          'El espacio permanece plano',
          'El espacio se curva mas intensamente',
          'La gravedad desaparece',
        ],
        correct: 1,
      },
      {
        q: 'Por que los objetos cercanos cambian su trayectoria alrededor de una gran masa?',
        options: [
          'Porque el espacio-tiempo se deforma',
          'Porque las estrellas empujan los objetos',
          'Porque no existe gravedad en el espacio',
        ],
        correct: 0,
      },
    ],
    debriefQuestion: {
      q: 'Cuando aumentaste la masa del cuerpo central en la simulacion, que observaste?',
      options: [
        'La malla espacial se curvo mas alrededor del cuerpo',
        'El espacio desaparecio',
        'Los cuerpos dejaron de moverse',
        'La gravedad cambio de color solamente',
      ],
      correct: 0,
    },
  },
  {
    id: 'orbit-02',
    codename: 'KEPLER-02',
    title: 'Estabiliza la orbita',
    subtitle: 'Encuentra el equilibrio entre velocidad y gravedad.',
    objective: 'Modifica la velocidad inicial de la sonda para que complete una orbita estable.',
    hint: 'Muy poca velocidad: cae. Demasiada: escapa. Hay un punto justo entre los dos.',
    discovery: 'Una orbita no es una caida fallida ni una huida fallida. Es el equilibrio exacto entre ambas.',
    bodies: [
      { id: 'planet', mass: 80, position: [0, 0, 0], velocity: [0, 0, 0],   color: '#B8D8FF', radius: 1.6, fixed: true, label: 'Planeta' },
      { id: 'probe',  mass: 1,  position: [7, 0, 0], velocity: [0, 0, 3.3], color: '#7DE2FC', radius: 0.3,  label: 'Sonda' },
    ],
    focus: 'velocity',
    quiz: [
      {
        q: 'Que necesita una sonda para mantener una orbita estable?',
        options: [
          'Tener velocidad y gravedad equilibradas',
          'Detenerse completamente',
          'Alejarse lo mas posible',
        ],
        correct: 0,
      },
      {
        q: 'Que sucede si la velocidad de una sonda es demasiado baja?',
        options: [
          'Escapa del sistema',
          'Se mantiene estable para siempre',
          'Puede caer hacia el cuerpo central',
        ],
        correct: 2,
      },
    ],
    debriefQuestion: {
      q: 'Que paso cuando encontraste la velocidad correcta para la sonda?',
      options: [
        'La sonda se quedo quieta',
        'La sonda completo una orbita estable',
        'La gravedad desaparecio',
        'El planeta exploto',
      ],
      correct: 1,
    },
  },
  {
    id: 'binary-03',
    codename: 'KEPLER-03',
    title: 'Sistema binario',
    subtitle: 'Dos masas se danzan mutuamente.',
    objective: 'Observa como dos estrellas similares se mueven alrededor de un centro comun.',
    hint: 'Si las dos masas son iguales, ninguna queda quieta. Ambas orbitan el punto medio.',
    discovery: 'En el universo, casi nada esta realmente quieto: todo orbita su centro de masa comun.',
    bodies: [
      { id: 'a',     mass: 40,  position: [-3, 0, 0], velocity: [0, 0,  2.3], color: '#FFB36B', radius: 1.1,  label: 'Estrella A' },
      { id: 'b',     mass: 40,  position: [ 3, 0, 0], velocity: [0, 0, -2.3], color: '#FF8A4C', radius: 1.1,  label: 'Estrella B' },
      { id: 'probe', mass: 0.5, position: [0, 0, 8],  velocity: [3.0, 0, 0],  color: '#7DE2FC', radius: 0.25, label: 'Sonda' },
    ],
    focus: 'free',
    quiz: [
      {
        q: 'Que ocurre en un sistema binario?',
        options: [
          'Un planeta deja de moverse',
          'Dos cuerpos giran alrededor de un centro comun',
          'La gravedad deja de actuar',
        ],
        correct: 1,
      },
      {
        q: 'Por que las dos estrellas del sistema binario permanecen conectadas?',
        options: [
          'Porque existe una fuerza gravitacional mutua',
          'Porque estan unidas fisicamente',
          'Porque no tienen masa',
        ],
        correct: 0,
      },
    ],
    debriefQuestion: {
      q: 'Que pudiste observar entre las dos estrellas del sistema binario?',
      options: [
        'Una estrella empujaba a la otra fuera del sistema',
        'Las dos estrellas giraban alrededor de un mismo centro',
        'Las estrellas dejaron de moverse',
        'Una estrella absorbio completamente a la otra',
      ],
      correct: 1,
    },
  },
];

export function getMission(id) {
  return missions.find((m) => m.id === id) ?? missions[0];
}
