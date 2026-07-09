import { useState, useMemo } from "react";
import type { Address } from "viem";
import { parseUnits } from "viem";
import TokenSelect from "./TokenSelect";
import { validateAmount } from "../stream/validation";
import type { ValidationError } from "../stream/validation";

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
  const [token, setToken] = useState<Address>("0x07865c6E87B9F70255377e024ace6630C1Eaa37F");
  const [amount, setAmount] = useState("");
  const [authority, setAuthority] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const amtBigInt = useMemo(() => {
    try {
      return amount ? parseUnits(amount, 18) : 0n;
    } catch {
      return -1n;
    }
  }, [amount]);

  const errors = useMemo(() => {
    const list: ValidationError[] = [];
    if (amtBigInt < 0n) {
      list.push({ field: "amount", message: "Invalid amount format" });
    } else {
      const amtErr = validateAmount(amtBigInt);
      if (amtErr) list.push(amtErr);
    }
    return list;
  }, [amtBigInt]);

  const getError = (field: string) =>
    submitted ? errors.find((e) => e.field === field)?.message : undefined;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    if (errors.length > 0 || !recipient || !amount || !authority) return;
    if (amtBigInt <= 0n) return;
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
          <TokenSelect value={token} onChange={setToken} />
        </div>

        <div>
          <label className="label">Amount (USDC)</label>
          <input
            type="number"
            step="0.000001"
            min="0.000001"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="1000"
            className={`input-field ${getError("amount") ? "border-error/50 focus:border-error" : ""}`}
            required
          />
          {getError("amount") && (
            <p className="text-error text-xs mt-1">{getError("amount")}</p>
          )}
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
