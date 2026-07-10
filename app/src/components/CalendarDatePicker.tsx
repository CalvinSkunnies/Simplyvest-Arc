import { useState, useEffect, useRef, useMemo } from "react";

interface Props {
  label: string;
  value: number;
  onChange: (ts: number) => void;
  min?: number;
  max?: number;
  error?: string;
}

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

function toDate(ts: number) { return new Date(ts * 1000); }
function fromDate(d: Date) { return Math.floor(d.getTime() / 1000); }

function daysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function startDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

function pad(n: number) { return String(n).padStart(2, "0"); }

export default function CalendarDatePicker({ label, value, onChange, min, max, error }: Props) {
  const [open, setOpen] = useState(false);
  const [viewYear, setViewYear] = useState(() => toDate(value || Date.now() / 1000).getFullYear());
  const [viewMonth, setViewMonth] = useState(() => toDate(value || Date.now() / 1000).getMonth());
  const [hours, setHours] = useState(() => pad(toDate(value || Date.now() / 1000).getHours()));
  const [minutes, setMinutes] = useState(() => pad(toDate(value || Date.now() / 1000).getMinutes()));
  const ref = useRef<HTMLDivElement>(null);

  const selected = useMemo(() => value > 0 ? toDate(value) : null, [value]);

  useEffect(() => {
    if (value > 0) {
      const d = toDate(value);
      setHours(pad(d.getHours()));
      setMinutes(pad(d.getMinutes()));
    }
  }, [value]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const days: (number | null)[] = useMemo(() => {
    const dim = daysInMonth(viewYear, viewMonth);
    const start = startDayOfMonth(viewYear, viewMonth);
    const arr: (number | null)[] = [];
    for (let i = 0; i < start; i++) arr.push(null);
    for (let d = 1; d <= dim; d++) arr.push(d);
    return arr;
  }, [viewYear, viewMonth]);

  function selectDay(day: number) {
    const d = new Date(viewYear, viewMonth, day, Number(hours), Number(minutes), 0);
    onChange(fromDate(d));
  }

  function commitTime() {
    if (value <= 0) return;
    const d = toDate(value);
    d.setHours(Number(hours), Number(minutes), 0);
    onChange(fromDate(d));
  }

  function canSelect(day: number): boolean {
    if (!min && !max) return true;
    const d = new Date(viewYear, viewMonth, day, Number(hours), Number(minutes), 0).getTime() / 1000;
    if (min && d < min) return false;
    if (max && d > max) return false;
    return true;
  }

  function isToday(day: number) {
    const t = new Date();
    return t.getFullYear() === viewYear && t.getMonth() === viewMonth && t.getDate() === day;
  }

  function isSelected(day: number) {
    return selected && selected.getFullYear() === viewYear && selected.getMonth() === viewMonth && selected.getDate() === day;
  }

  const displayStr = value > 0
    ? `${MONTHS[selected!.getMonth()]} ${selected!.getDate()}, ${selected!.getFullYear()} at ${pad(selected!.getHours())}:${pad(selected!.getMinutes())}`
    : "";

  function prevMonth() {
    if (viewMonth === 0) { setViewYear((y) => y - 1); setViewMonth(11); }
    else setViewMonth((m) => m - 1);
  }

  function nextMonth() {
    if (viewMonth === 11) { setViewYear((y) => y + 1); setViewMonth(0); }
    else setViewMonth((m) => m + 1);
  }

  return (
    <div ref={ref} className="relative">
      <label className="label">{label}</label>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`input-field flex items-center gap-2 text-left ${error ? "border-error/50 focus:border-error" : ""}`}
      >
        <svg className="w-4 h-4 text-text-muted shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <span className={value > 0 ? "text-text-primary" : "text-text-muted"}>
          {displayStr || "Select date & time"}
        </span>
      </button>
      {error && <p className="text-error text-xs mt-1">{error}</p>}

      {open && (
        <div className="absolute z-50 mt-1 w-[300px] card border border-base-500/30 shadow-xl shadow-black/30 overflow-hidden animate-fade-in">
          <div className="flex items-center justify-between px-4 pt-3 pb-2">
            <button type="button" onClick={prevMonth} className="btn-ghost p-1">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <span className="text-sm font-semibold text-text-primary">
              {MONTHS[viewMonth]} {viewYear}
            </span>
            <button type="button" onClick={nextMonth} className="btn-ghost p-1">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          <div className="grid grid-cols-7 px-3 pb-1">
            {DAYS.map((d) => (
              <div key={d} className="text-center text-text-muted text-[11px] font-semibold uppercase py-1">{d}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 px-3 pb-2">
            {days.map((day, i) =>
              day === null ? (
                <div key={`e-${i}`} />
              ) : (
                <button
                  key={day}
                  type="button"
                  disabled={!canSelect(day)}
                  onClick={() => selectDay(day)}
                  className={`text-sm w-full aspect-square rounded-lg flex items-center justify-center transition-colors
                    ${isSelected(day) ? "bg-plum-800 text-white font-semibold" : ""}
                    ${isToday(day) && !isSelected(day) ? "border border-plum-800/40 text-plum-300" : ""}
                    ${!isSelected(day) && !isToday(day) ? "text-text-primary hover:bg-base-700" : ""}
                    ${!canSelect(day) ? "opacity-25 cursor-not-allowed hover:bg-transparent" : "cursor-pointer"}
                  `}
                >
                  {day}
                </button>
              ),
            )}
          </div>

          <div className="flex items-center gap-2 px-4 pb-3 pt-2 border-t border-base-500/20">
            <span className="text-text-muted text-xs">Time</span>
            <select
              value={hours}
              onChange={(e) => { setHours(e.target.value); if (value > 0) { const d = toDate(value); d.setHours(Number(e.target.value), Number(minutes), 0); onChange(fromDate(d)); } }}
              className="input-field text-sm py-1.5 w-[72px]"
            >
              {Array.from({ length: 24 }, (_, i) => (
                <option key={i} value={pad(i)}>{pad(i)}</option>
              ))}
            </select>
            <span className="text-text-muted">:</span>
            <select
              value={minutes}
              onChange={(e) => { setMinutes(e.target.value); if (value > 0) { const d = toDate(value); d.setHours(Number(hours), Number(e.target.value), 0); onChange(fromDate(d)); } }}
              className="input-field text-sm py-1.5 w-[72px]"
            >
              {Array.from({ length: 60 }, (_, i) => (
                <option key={i} value={pad(i)}>{pad(i)}</option>
              ))}
            </select>
          </div>
        </div>
      )}
    </div>
  );
}
