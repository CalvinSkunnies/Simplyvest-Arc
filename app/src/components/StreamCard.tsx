import { useState } from "react";
import { formatUnits, type Address } from "viem";

interface StreamData {
  creator: `0x${string}`;
  recipient: `0x${string}`;
  token: `0x${string}`;
  amount: bigint;
  amountWithdrawn: bigint;
  startTime: bigint;
  cliffTime: bigint;
  endTime: bigint;
  cancelled: boolean;
}

interface MilestoneStreamData {
  creator: `0x${string}`;
  recipient: `0x${string}`;
  token: `0x${string}`;
  amount: bigint;
  amountWithdrawn: bigint;
  milestoneAuthority: `0x${string}`;
  milestoneReached: boolean;
  cancelled: boolean;
}

type S = StreamData | MilestoneStreamData;

function isMilestone(s: S): s is MilestoneStreamData {
  return "milestoneReached" in s;
}

function progress(amount: bigint, withdrawn: bigint): number {
  if (amount === 0n) return 0;
  return Number((withdrawn * 10000n) / amount) / 100;
}

interface Props {
  id: `0x${string}`;
  stream: S;
  claimable: bigint;
  currentUser: `0x${string}`;
  isCreator: boolean;
  isRecipient: boolean;
  isAuthority?: boolean;
  withdrawAmount: string;
  onWithdrawAmountChange: (val: string) => void;
  onWithdraw: () => void;
  onCancel: () => void;
  onDepositMore: (amount: string) => void;
  onTransfer: (newRecipient: Address) => void;
  onTrigger?: () => void;
  loading: boolean;
}

export default function StreamCard({
  id,
  stream,
  claimable,
  currentUser,
  isCreator,
  isRecipient,
  isAuthority,
  withdrawAmount,
  onWithdrawAmountChange,
  onWithdraw,
  onCancel,
  onDepositMore,
  onTransfer,
  onTrigger,
  loading,
}: Props) {
  const [showDeposit, setShowDeposit] = useState(false);
  const [depositAmt, setDepositAmt] = useState("");
  const [showTransfer, setShowTransfer] = useState(false);
  const [transferAddr, setTransferAddr] = useState("");

  const pct = progress(stream.amount, stream.amountWithdrawn);
  const done = stream.amountWithdrawn >= stream.amount;
  const active = !stream.cancelled && !done;
  const mil = isMilestone(stream);

  const handleDeposit = () => {
    if (depositAmt) {
      onDepositMore(depositAmt);
      setDepositAmt("");
      setShowDeposit(false);
    }
  };

  const handleTransfer = () => {
    if (transferAddr) {
      onTransfer(transferAddr as Address);
      setTransferAddr("");
      setShowTransfer(false);
    }
  };

  return (
    <div className="card overflow-hidden animate-slide-up">
      <div className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-mono text-text-muted truncate">{id}</p>
            <div className="flex items-center gap-3 mt-1.5">
              <p className="text-xs text-text-secondary">
                {isCreator ? "To" : "From"}:{" "}
                <span className="font-mono text-text-primary">
                  {stream.recipient.slice(0, 6)}...{stream.recipient.slice(-4)}
                </span>
              </p>
              {mil && isAuthority && (
                <span className="text-xs text-plum-300">(Authority)</span>
              )}
            </div>
          </div>
          <div className="flex gap-2 shrink-0">
            {stream.cancelled && <span className="badge-cancelled">Cancelled</span>}
            {!stream.cancelled && done && <span className="badge-completed">Completed</span>}
            {mil && (stream as MilestoneStreamData).milestoneReached && !stream.cancelled && (
              <span className="badge-active">Triggered</span>
            )}
            {!stream.cancelled && !done && !mil && <span className="badge-active">Active</span>}
          </div>
        </div>

        {/* Progress bar */}
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-1.5">
            <span className="text-text-secondary">
              {formatUnits(stream.amountWithdrawn, 18)} /{" "}
              {formatUnits(stream.amount, 18)} USDC
            </span>
            <span className="text-plum-300 font-semibold font-mono">{pct}%</span>
          </div>
          <div className="h-2 bg-base-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-plum-800 to-plum-500 rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${Math.min(pct, 100)}%` }}
            />
          </div>
        </div>

        {/* Claimable */}
        <div className="flex items-center justify-between bg-base-800/50 rounded-xl px-4 py-2.5 mb-4">
          <span className="text-text-secondary text-sm">Claimable</span>
          <span className="text-plum-300 font-semibold font-mono text-sm">
            {formatUnits(claimable, 18)} USDC
          </span>
        </div>

        {/* Actions */}
        {active && (
          <div className="flex flex-wrap gap-2">
            {/* Withdraw */}
            {!mil && (
              <div className="flex gap-2 items-center flex-1 min-w-0">
                <input
                  type="number"
                  step="0.000001"
                  min="0"
                  max={formatUnits(claimable, 18)}
                  placeholder="Amount"
                  value={withdrawAmount}
                  onChange={(e) => onWithdrawAmountChange(e.target.value)}
                  className="input-field flex-1 min-w-[100px]"
                />
                <button
                  onClick={onWithdraw}
                  disabled={loading || !withdrawAmount}
                  className="btn-primary text-sm px-4 py-2.5 whitespace-nowrap"
                >
                  {loading ? "..." : "Withdraw"}
                </button>
              </div>
            )}
            {mil && (stream as MilestoneStreamData).milestoneReached && (
              <button
                onClick={onWithdraw}
                disabled={loading}
                className="btn-primary text-sm px-4 py-2.5"
              >
                {loading ? "..." : "Withdraw All"}
              </button>
            )}

            {/* Top Up (creator only, time streams) */}
            {!mil && isCreator && (
              showDeposit ? (
                <div className="flex gap-2 items-center w-full">
                  <input
                    type="number"
                    step="0.000001"
                    min="0"
                    placeholder="Amount to add"
                    value={depositAmt}
                    onChange={(e) => setDepositAmt(e.target.value)}
                    className="input-field flex-1"
                  />
                  <button onClick={handleDeposit} disabled={loading || !depositAmt} className="btn-primary text-sm px-4 py-2.5">
                    {loading ? "..." : "Confirm"}
                  </button>
                  <button onClick={() => setShowDeposit(false)} className="btn-secondary text-sm px-3 py-2.5">x</button>
                </div>
              ) : (
                <button onClick={() => setShowDeposit(true)} className="btn-secondary text-sm px-4 py-2.5">
                  Top Up
                </button>
              )
            )}

            {/* Transfer (recipient only) */}
            {isRecipient && (
              showTransfer ? (
                <div className="flex gap-2 items-center w-full">
                  <input
                    type="text"
                    placeholder="New recipient address"
                    value={transferAddr}
                    onChange={(e) => setTransferAddr(e.target.value)}
                    className="input-field flex-1 font-mono text-xs"
                  />
                  <button onClick={handleTransfer} disabled={loading || !transferAddr} className="btn-primary text-sm px-4 py-2.5">
                    {loading ? "..." : "Confirm"}
                  </button>
                  <button onClick={() => setShowTransfer(false)} className="btn-secondary text-sm px-3 py-2.5">x</button>
                </div>
              ) : (
                <button onClick={() => setShowTransfer(true)} className="btn-secondary text-sm px-4 py-2.5">
                  Transfer
                </button>
              )
            )}

            {/* Trigger (authority only) */}
            {mil && isAuthority && !(stream as MilestoneStreamData).milestoneReached && (
              <button
                onClick={onTrigger}
                disabled={loading}
                className="btn-primary text-sm px-4 py-2.5"
              >
                {loading ? "..." : "Trigger"}
              </button>
            )}

            {/* Cancel (creator or recipient) */}
            {((!mil && (isCreator || isRecipient)) || (mil && (isCreator || isRecipient) && !(stream as MilestoneStreamData).milestoneReached)) && (
              <button
                onClick={onCancel}
                disabled={loading}
                className="btn-secondary text-sm px-4 py-2.5"
              >
                Cancel
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
