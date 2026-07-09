export default function LandingHero({ onConnect }: { onConnect: () => void }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-plum-950/20 via-transparent to-transparent pointer-events-none" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-plum-800/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 text-center px-6 animate-fade-in">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-base-700/50 border border-base-500/30 mb-8">
          <span className="w-2 h-2 rounded-full bg-plum-400 animate-pulse" />
          <span className="text-text-muted text-xs font-medium tracking-wide">
            Arc Testnet
          </span>
        </div>

        <h1 className="text-5xl md:text-7xl font-display font-bold tracking-tight mb-4">
          <span className="text-text-primary">Simply</span>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-plum-400 to-plum-200">
            Vest
          </span>
        </h1>

        <p className="text-text-secondary text-lg md:text-xl max-w-lg mx-auto mb-10 leading-relaxed">
          Time-based and milestone-gated vesting streams on Arc Testnet.
          Secure, transparent, and fully on-chain.
        </p>

        <button onClick={onConnect} className="btn-primary text-lg px-10 py-4 animate-pulse-glow">
          Connect Wallet
        </button>

        <div className="grid grid-cols-3 gap-8 max-w-lg mx-auto mt-16">
          {[
            ["Time Streams", "Linear unlock with cliff"],
            ["Milestone Streams", "Event-gated release"],
            ["Cancel Anytime", "Creator-controlled"],
          ].map(([title, desc]) => (
            <div key={title} className="text-center">
              <p className="text-plum-300 text-sm font-semibold font-display mb-1">{title}</p>
              <p className="text-text-muted text-xs">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
