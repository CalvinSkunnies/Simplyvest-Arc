import { useEffect, useState } from "react";
import type { Hash } from "viem";

interface Props {
  txHash: Hash | null;
  error: string | null;
  onDismiss: () => void;
}

export default function TxToast({ txHash, error, onDismiss }: Props) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (txHash || error) {
      setVisible(true);
      const timer = setTimeout(() => setVisible(false), 8000);
      return () => clearTimeout(timer);
    }
  }, [txHash, error]);

  if (!visible || (!txHash && !error)) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-sm animate-slide-up">
      <div className="card border-plum-800/30 p-4 shadow-xl shadow-plum-950/20">
        {txHash && (
          <div className="flex items-start gap-3">
            <div className="w-5 h-5 mt-0.5 rounded-full bg-success/20 border border-success/30 flex items-center justify-center shrink-0">
              <svg className="w-3 h-3 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-text-primary">Transaction sent</p>
              <a
                href={`https://testnet.arcscan.app/tx/${txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-plum-300 underline font-mono break-all hover:text-plum-200"
              >
                {txHash.slice(0, 10)}...{txHash.slice(-6)}
              </a>
            </div>
          </div>
        )}
        {error && (
          <div className="flex items-start gap-3">
            <div className="w-5 h-5 mt-0.5 rounded-full bg-error/20 border border-error/30 flex items-center justify-center shrink-0">
              <svg className="w-3 h-3 text-error" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-text-primary">Error</p>
              <p className="text-xs text-text-secondary mt-0.5">{error}</p>
            </div>
          </div>
        )}
        <button
          onClick={() => { setVisible(false); onDismiss(); }}
          className="absolute top-2 right-2 text-text-muted hover:text-text-secondary text-lg leading-none"
        >
          &times;
        </button>
      </div>
    </div>
  );
}
