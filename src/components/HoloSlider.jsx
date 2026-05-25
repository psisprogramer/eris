/* Slider holográfico estilizado. Compatible con cualquier input range. */
import './HoloSlider.css';

export default function HoloSlider({
  label,
  value,
  min,
  max,
  step = 0.1,
  unit = '',
  onChange,
}) {
  return (
    <label className="holo-slider">
      <div className="holo-slider-head">
        <span className="holo-slider-label">{label}</span>
        <span className="holo-slider-value">{Number(value).toFixed(step < 1 ? 1 : 0)} {unit}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange?.(parseFloat(e.target.value))}
      />
      <div className="holo-slider-track">
        <div
          className="holo-slider-fill"
          style={{ width: `${((value - min) / (max - min)) * 100}%` }}
        />
      </div>
    </label>
  );
}
