import type { Address } from "viem";
import { arcTestnet } from "../arc-chain";

interface Props {
  address: Address | null;
  chainId: number | null;
  error: string | null;
  onConnect: () => void;
  onDisconnect: () => void;
}

export default function ConnectWallet({
  address,
  chainId,
  error,
  onConnect,
  onDisconnect,
}: Props) {
  if (!window.ethereum) {
    return (
      <a
        href="https://metamask.io/download/"
        target="_blank"
        rel="noopener noreferrer"
        className="btn-primary text-sm px-4 py-2"
      >
        Install Wallet
      </a>
    );
  }

  if (!address) {
    return (
      <button onClick={onConnect} className="btn-primary text-sm px-5 py-2">
        Connect Wallet
      </button>
    );
  }

  const wrongChain = chainId !== arcTestnet.id;

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-2 bg-base-800 border border-base-500/30 px-3 py-1.5 rounded-xl">
        <span
          className={`w-2 h-2 rounded-full ${
            wrongChain ? "bg-error" : "bg-success"
          }`}
        />
        <span className="text-sm font-mono text-text-primary">
          {address.slice(0, 6)}...{address.slice(-4)}
        </span>
      </div>
      {wrongChain && (
        <span className="text-error text-xs">Wrong network</span>
      )}
      <button
        onClick={onDisconnect}
        className="btn-ghost text-xs"
      >
        Disconnect
      </button>
    </div>
  );
}
