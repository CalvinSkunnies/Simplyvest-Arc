import { toDatetimeLocal } from "../stream/validation";

interface Props {
  label: string;
  value: number;
  onChange: (ts: number) => void;
  min?: number;
  max?: number;
  error?: string;
}

export default function StreamDatePicker({
  label,
  value,
  onChange,
  min,
  max,
  error,
}: Props) {
  const strVal = value > 0 ? toDatetimeLocal(value) : "";
  const minStr = min ? toDatetimeLocal(min) : undefined;
  const maxStr = max ? toDatetimeLocal(max) : undefined;

  return (
    <div>
      <label className="label">{label}</label>
      <input
        type="datetime-local"
        value={strVal}
        min={minStr}
        max={maxStr}
        onChange={(e) => {
          const ts = e.target.value
            ? Math.floor(new Date(e.target.value).getTime() / 1000)
            : 0;
          onChange(ts);
        }}
        className={`input-field ${error ? "border-error/50 focus:border-error focus:ring-error/20" : ""}`}
      />
      {error && (
        <p className="text-error text-xs mt-1">{error}</p>
      )}
    </div>
  );
}
