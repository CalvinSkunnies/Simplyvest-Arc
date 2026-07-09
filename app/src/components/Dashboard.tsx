import { useEffect, useRef, useState } from "react";

interface Props {
  totalStreams: number;
  activeStreams: number;
  totalValue: string;
  claimableNow: string;
}

export default function Dashboard({
  totalStreams,
  activeStreams,
  totalValue,
  claimableNow,
}: Props) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8 animate-fade-in">
      <StatCard
        label="Total Streams"
        value={String(totalStreams)}
        delay={0}
      />
      <StatCard
        label="Active"
        value={String(activeStreams)}
        delay={0.1}
      />
      <StatCard
        label="Total Value"
        value={totalValue}
        delay={0.2}
      />
      <StatCard
        label="Claimable Now"
        value={claimableNow}
        highlight
        delay={0.3}
      />
    </div>
  );
}

function StatCard({
  label,
  value,
  delay,
  highlight,
}: {
  label: string;
  value: string;
  delay: number;
  highlight?: boolean;
}) {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), delay * 1000);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div
      ref={ref}
      className={`card p-4 transition-all duration-500 ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      } ${highlight ? "border-plum-800/40 bg-plum-950/20" : ""}`}
    >
      <p className="stat-label mb-1">{label}</p>
      <p
        className={`stat-value text-lg ${
          highlight ? "text-plum-300" : "text-text-primary"
        }`}
      >
        {value || "—"}
      </p>
    </div>
  );
}
