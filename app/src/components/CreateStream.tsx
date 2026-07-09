import { useState } from "react";
import type { Address } from "viem";

interface Props {
  onCreate: (
    recipient: Address,
    token: Address,
    amount: string,
    startTime: number,
    cliffTime: number,
    endTime: number
  ) => void;
  loading: boolean;
}

export default function CreateStream({ onCreate, loading }: Props) {
  const [recipient, setRecipient] = useState("");
  const [token, setToken] = useState("0x07865c6E87B9F70255377e024ace6630C1Eaa37F");
  const [amount, setAmount] = useState("");
  const [startDelay, setStartDelay] = useState("0");
  const [cliffDelay, setCliffDelay] = useState("0");
  const [duration, setDuration] = useState("2592000");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const now = Math.floor(Date.now() / 1000);
    onCreate(
      recipient as Address,
      token as Address,
      amount,
      now + Number(startDelay),
      now + Number(cliffDelay),
      now + Number(duration)
    );
  };

  return (
    <form onSubmit={handleSubmit} className="card p-6 max-w-xl animate-fade-in">
      <h2 className="section-title mb-6">Create Time Stream</h2>

      <div className="space-y-5">
        <div>
          <label className="label">Recipient</label>
          <input
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            placeholder="0x..."
            className="input-field font-mono"
            required
          />
        </div>

        <div>
          <label className="label">Token</label>
          <input
            value={token}
            onChange={(e) => setToken(e.target.value)}
            className="input-field font-mono text-xs"
            required
          />
        </div>

        <div>
          <label className="label">Amount (USDC)</label>
          <input
            type="number"
            step="0.000001"
            min="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="1000"
            className="input-field"
            required
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="label">Start delay</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="0"
                value={startDelay}
                onChange={(e) => setStartDelay(e.target.value)}
                className="input-field"
              />
              <span className="text-text-muted text-xs">sec</span>
            </div>
          </div>
          <div>
            <label className="label">Cliff delay</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="0"
                value={cliffDelay}
                onChange={(e) => setCliffDelay(e.target.value)}
                className="input-field"
              />
              <span className="text-text-muted text-xs">sec</span>
            </div>
          </div>
          <div>
            <label className="label">Duration</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="1"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="2592000"
                className="input-field"
              />
              <span className="text-text-muted text-xs">sec</span>
            </div>
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="btn-primary w-full mt-6"
      >
        {loading ? "Confirming..." : "Create Stream"}
      </button>
    </form>
  );
}
