/* ============================================================
   SideNav · barra vertical lateral del observatorio
   Modos de cámara / observación. Solo afecta la cámara visual.
   ============================================================ */

import './SideNav.css';

/* Iconos SVG inline — sin librerías externas */
const Icons = {
  cursor: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
      <path d="M5 3 L19 12 L12 14 L9 21 Z" />
    </svg>
  ),
  orbit: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
      <ellipse cx="12" cy="12" rx="9" ry="3.5" transform="rotate(-25 12 12)" />
      <circle cx="12" cy="12" r="2.6" fill="currentColor" stroke="none" />
    </svg>
  ),
  target: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="4.5" />
      <circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" />
    </svg>
  ),
  controls: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
      <path d="M6 5 L6 11" />
      <path d="M6 14 L6 19" />
      <path d="M12 5 L12 8" />
      <path d="M12 11 L12 19" />
      <path d="M18 5 L18 14" />
      <path d="M18 17 L18 19" />
      <circle cx="6"  cy="12.5" r="1.8" fill="currentColor" stroke="none" />
      <circle cx="12" cy="9.5"  r="1.8" fill="currentColor" stroke="none" />
      <circle cx="18" cy="15.5" r="1.8" fill="currentColor" stroke="none" />
    </svg>
  ),
  scope: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
      <circle cx="12" cy="12" r="7" />
      <path d="M12 3 L12 6" />
      <path d="M12 18 L12 21" />
      <path d="M3 12 L6 12" />
      <path d="M18 12 L21 12" />
    </svg>
  ),
};

export default function SideNav({ active = 'cursor', onSelect }) {
  const items = [
    { id: 'cursor',   label: 'Observar',  icon: Icons.cursor   },
    { id: 'orbit',    label: 'Órbita',    icon: Icons.orbit    },
    { id: 'target',   label: 'Centrar',   icon: Icons.target   },
    { id: 'controls', label: 'Sistema',   icon: Icons.controls },
    { id: 'scope',    label: 'Telescopio',icon: Icons.scope    },
  ];

  return (
    <nav className="sidenav" aria-label="Modos de observación">
      <span className="sidenav-tab">MODO</span>
      <ul>
        {items.map((it) => (
          <li key={it.id}>
            <button
              className={`sidenav-btn ${active === it.id ? 'is-active' : ''}`}
              onClick={() => onSelect?.(it.id)}
              title={it.label}
              aria-label={it.label}
            >
              {it.icon}
              <span className="sidenav-tip">{it.label}</span>
            </button>
          </li>
        ))}
      </ul>
      <span className="sidenav-bottom">
        <span className="sidenav-pulse" />
      </span>
    </nav>
  );
}
