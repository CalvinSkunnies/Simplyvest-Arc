interface Props {
  amount: bigint;
  startTime: number;
  cliffTime: number;
  endTime: number;
  nowTime?: number;
  simTime?: number;
  simVested?: bigint;
}

const W = 600;
const H = 280;
const L = 55;
const R = 25;
const T = 20;
const B = 55;
const CW = W - L - R;
const CH = H - T - B;

function formatDateShort(ts: number): string {
  return new Date(ts * 1000).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function formatAxisAmount(amount: bigint): string {
  const n = Number(amount) / 1e18;
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  if (n >= 1) return n.toFixed(0);
  return n.toFixed(2);
}

export default function VestingCurve({
  amount, startTime, cliffTime, endTime, nowTime, simTime, simVested,
}: Props) {
  const duration = endTime - startTime;
  if (duration <= 0 || amount <= 0n) {
    return (
      <div className="flex items-center justify-center h-[280px] text-text-muted text-sm">
        No vesting curve available
      </div>
    );
  }

  const xMap = (t: number) => L + Math.max(0, Math.min(1, (t - startTime) / duration)) * CW;
  const yMap = (v: bigint) => T + CH - (Number(v) / Number(amount)) * CH;
  const yAt = (ratio: number) => T + CH - ratio * CH;

  const sx = xMap(startTime);
  const cx = xMap(cliffTime);
  const ex = xMap(endTime);
  const top = yAt(0);
  const bottom = yAt(1);

  const hasSim = simTime !== undefined && simVested !== undefined;

  const gridX = [startTime, startTime + duration * 0.25, startTime + duration * 0.5, startTime + duration * 0.75, endTime].map(t =>
    Math.round(t)
  );
  const gridY = [0n, amount / 4n, amount / 2n, (amount * 3n) / 4n, amount];

  const colors = {
    stroke: 'rgb(var(--color-plum-400))',
    strokeDim: 'rgb(var(--color-base-500))',
    muted: 'rgb(var(--color-text-muted))',
    warning: 'rgb(var(--color-warning))',
    plumLight: 'rgb(var(--color-plum-300))',
    bgCard: 'rgb(var(--color-bg-card))',
  };

  return (
    <div className="w-full overflow-x-auto">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full max-w-[600px] h-auto" style={{ display: 'block' }}>
        {gridY.map((v, i) => {
          const yy = yMap(v);
          return (
            <g key={`gy${i}`}>
              <line x1={L} y1={yy} x2={L + CW} y2={yy} stroke={colors.strokeDim} strokeOpacity={0.12} strokeWidth={1} />
              <text x={L - 8} y={yy + 4} textAnchor="end" fill={colors.muted} fontSize={11}>{formatAxisAmount(v)}</text>
            </g>
          );
        })}

        {gridX.map((t, i) => {
          const xx = xMap(t);
          return (
            <g key={`gx${i}`}>
              <line x1={xx} y1={T} x2={xx} y2={T + CH} stroke={colors.strokeDim} strokeOpacity={0.08} strokeWidth={1} />
              <text x={xx} y={T + CH + 18} textAnchor="middle" fill={colors.muted} fontSize={11}>{formatDateShort(t)}</text>
            </g>
          );
        })}

        <text x={L} y={T - 6} fill={colors.muted} fontSize={11}>Vested</text>

        <path
          d={`M ${sx} ${bottom} L ${cx} ${bottom} L ${ex} ${top}`}
          fill="none"
          stroke={colors.stroke}
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        <path
          d={`M ${sx} ${T + CH} L ${sx} ${bottom} L ${cx} ${bottom} L ${ex} ${top} L ${ex} ${T + CH} Z`}
          fill={colors.stroke}
          opacity={0.1}
        />

        {[sx, cx, ex].map((px, i) => (
          <circle key={`dot${i}`} cx={px} cy={i === 2 ? top : bottom} r={4} fill={colors.stroke} />
        ))}

        {sx !== cx && (
          <>
            <text x={sx} y={T + CH + 35} textAnchor="start" fill={colors.muted} fontSize={10}>Start</text>
            <text x={cx} y={T + CH + 35} textAnchor="middle" fill={colors.muted} fontSize={10}>Cliff</text>
            <text x={ex} y={T + CH + 35} textAnchor="end" fill={colors.muted} fontSize={10}>End</text>
          </>
        )}

        {nowTime !== undefined && (() => {
          const nx = xMap(nowTime);
          return (
            <g key="now-marker">
              <line x1={nx} y1={T} x2={nx} y2={T + CH} stroke={colors.plumLight} strokeOpacity={0.5} strokeWidth={1.5} strokeDasharray="4 3" />
              <text x={nx} y={T - 6} textAnchor="middle" fill={colors.plumLight} fontSize={10}>Now</text>
            </g>
          );
        })()}

        {hasSim && (() => {
          const siX = xMap(simTime!);
          const siY = yMap(simVested!);
          return (
            <g key="sim-marker">
              <line x1={siX} y1={T} x2={siX} y2={T + CH} stroke={colors.warning} strokeOpacity={0.6} strokeWidth={1.5} strokeDasharray="4 3" />
              <circle cx={siX} cy={siY} r={6} fill={colors.warning} stroke={colors.bgCard} strokeWidth={2} />
              <text x={siX} y={siY - 12} textAnchor="middle" fill={colors.warning} fontSize={10} fontWeight={600}>Sim</text>
            </g>
          );
        })()}
      </svg>
    </div>
  );
}
