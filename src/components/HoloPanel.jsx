/* Panel holográfico reutilizable. Soporta variantes y esquinas marcadas. */
import './HoloPanel.css';

export default function HoloPanel({
  title,
  subtitle,
  children,
  className = '',
  variant = 'default', // default | strong | quiet
  corners = true,
  scanline = false,
  style,
}) {
  return (
    <div className={`holo-panel holo-${variant} ${className}`} style={style}>
      {corners && (
        <>
          <span className="holo-corner tl" />
          <span className="holo-corner tr" />
          <span className="holo-corner bl" />
          <span className="holo-corner br" />
        </>
      )}
      {(title || subtitle) && (
        <header className="holo-head">
          {title && <h3 className="holo-title">{title}</h3>}
          {subtitle && <span className="holo-sub">{subtitle}</span>}
        </header>
      )}
      <div className="holo-body">{children}</div>
      {scanline && <div className="scanline" />}
    </div>
  );
}
