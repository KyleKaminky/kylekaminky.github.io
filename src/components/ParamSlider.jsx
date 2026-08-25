/*
   One parameter. The slider writes straight into state on input, and the
   running sketch picks the new value up on its next frame — nothing is
   rebuilt, which is what makes it feel live rather than like a reload.
*/

export default function ParamSlider({ param, value, onChange }) {
  // A 0/1 step-1 parameter is a toggle in disguise; show it as one.
  const isBool = param.min === 0 && param.max === 1 && param.step === 1;
  const display = isBool ? (value ? 'On' : 'Off') : `${value}${param.unit ?? ''}`;

  return (
    <label className="param">
      <span className="param-name">{param.label}</span>
      <span className="param-value">{display}</span>
      <input
        type="range"
        min={param.min}
        max={param.max}
        step={param.step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </label>
  );
}
