import { useState } from "react";
import type { Address } from "viem";

interface Props {
  onCreate: (
    recipient: Address,
    token: Address,
    amount: string,
    milestoneAuthority: Address
  ) => void;
  loading: boolean;
}

export default function CreateMilestoneStream({
  onCreate,
  loading,
}: Props) {
  const [recipient, setRecipient] = useState("");
  const [token, setToken] = useState("0x07865c6E87B9F70255377e024ace6630C1Eaa37F");
  const [amount, setAmount] = useState("");
  const [authority, setAuthority] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreate(
      recipient as Address,
      token as Address,
      amount,
      authority as Address
    );
  };

  return (
    <form onSubmit={handleSubmit} className="card p-6 max-w-xl animate-fade-in">
      <h2 className="section-title mb-6">Create Milestone Stream</h2>

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

        <div>
          <label className="label">Milestone Authority</label>
          <input
            value={authority}
            onChange={(e) => setAuthority(e.target.value)}
            placeholder="0x..."
            className="input-field font-mono"
            required
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="btn-primary w-full mt-6"
      >
        {loading ? "Confirming..." : "Create Milestone Stream"}
      </button>
    </form>
  );
}
