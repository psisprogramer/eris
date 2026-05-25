import './HoloButton.css';

export default function HoloButton({
  children,
  onClick,
  variant = 'primary', // primary | ghost | danger
  size = 'md',
  className = '',
  type = 'button',
  disabled = false,
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`holo-btn holo-btn-${variant} holo-btn-${size} ${className}`}
    >
      <span className="holo-btn-edge tl" />
      <span className="holo-btn-edge tr" />
      <span className="holo-btn-edge bl" />
      <span className="holo-btn-edge br" />
      <span className="holo-btn-label">{children}</span>
    </button>
  );
}
