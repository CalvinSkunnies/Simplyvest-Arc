import { useState, useRef, useEffect, useMemo } from "react";
import type { Address } from "viem";
import { isAddress } from "viem";
import { COMMON_TOKENS, type TokenInfo } from "../tokens";

interface Props {
  value: Address;
  onChange: (addr: Address) => void;
  error?: string;
}

const TOKEN_COLORS: Record<string, string> = {
  USDC: "bg-blue-500",
};

function TokenIcon({ token }: { token: TokenInfo }) {
  const color = TOKEN_COLORS[token.symbol] || "bg-plum-500";
  return (
    <div
      className={`w-7 h-7 rounded-full ${color} flex items-center justify-center text-white text-xs font-bold shrink-0`}
    >
      {token.symbol.slice(0, 2)}
    </div>
  );
}

export default function TokenSelect({ value, onChange, error }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [showCustom, setShowCustom] = useState(false);
  const [customAddr, setCustomAddr] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedToken = useMemo(
    () => COMMON_TOKENS.find((t) => t.address.toLowerCase() === value.toLowerCase()),
    [value],
  );

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return COMMON_TOKENS.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.symbol.toLowerCase().includes(q) ||
        t.address.toLowerCase().includes(q),
    );
  }, [search]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setShowCustom(false);
        setCustomAddr("");
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function selectToken(token: TokenInfo) {
    onChange(token.address);
    setIsOpen(false);
    setShowCustom(false);
    setSearch("");
    setCustomAddr("");
  }

  function openCustom() {
    setShowCustom(true);
    setSearch("");
  }

  function applyCustom() {
    if (isAddress(customAddr)) {
      onChange(customAddr as Address);
      setIsOpen(false);
      setShowCustom(false);
      setCustomAddr("");
    }
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`input-field flex items-center gap-2 text-left ${error ? "border-error/50 focus:border-error" : ""}`}
      >
        {selectedToken ? (
          <>
            <TokenIcon token={selectedToken} />
            <span className="flex-1">{selectedToken.symbol}</span>
            <span className="text-text-muted text-xs truncate max-w-[120px] hidden sm:inline">
              {selectedToken.name}
            </span>
          </>
        ) : (
          <>
            <div className="w-7 h-7 rounded-full bg-base-600 flex items-center justify-center text-text-muted text-xs font-bold shrink-0">
              ?
            </div>
            <span className="flex-1 text-text-muted font-mono text-xs truncate">
              {value}
            </span>
          </>
        )}
        <svg
          className={`w-4 h-4 text-text-muted transition-transform ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {error && <p className="text-error text-xs mt-1">{error}</p>}

      {isOpen && (
        <div className="absolute z-50 mt-1 w-full card border border-base-500/30 shadow-xl shadow-black/30 overflow-hidden animate-fade-in">
          <div className="p-2 border-b border-base-500/20">
            <input
              autoFocus
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setShowCustom(false);
              }}
              placeholder="Search tokens…"
              className="input-field text-sm py-2"
            />
          </div>

          <div className="max-h-60 overflow-y-auto">
            {filtered.map((token) => (
              <button
                key={token.address}
                type="button"
                onClick={() => selectToken(token)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-base-700 ${
                  token.address.toLowerCase() === value.toLowerCase()
                    ? "bg-plum-900/20 border-l-2 border-plum-600"
                    : ""
                }`}
              >
                <TokenIcon token={token} />
                <div className="flex-1 min-w-0">
                  <div className="text-text-primary text-sm font-medium">{token.symbol}</div>
                  <div className="text-text-muted text-xs truncate">{token.name}</div>
                </div>
              </button>
            ))}

            {filtered.length === 0 && search && (
              <div className="px-3 py-4 text-text-muted text-sm text-center">
                No tokens match "{search}"
              </div>
            )}
          </div>

          <div className="border-t border-base-500/20">
            {showCustom ? (
              <div className="p-2 flex gap-2">
                <input
                  type="text"
                  value={customAddr}
                  onChange={(e) => setCustomAddr(e.target.value)}
                  placeholder="0x..."
                  className="input-field font-mono text-xs py-2 flex-1"
                />
                <button
                  type="button"
                  onClick={applyCustom}
                  disabled={!isAddress(customAddr)}
                  className="btn-primary text-sm py-2 px-3 whitespace-nowrap"
                >
                  Apply
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={openCustom}
                className="w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-base-700 text-text-muted"
              >
                <div className="w-7 h-7 rounded-full bg-base-600 flex items-center justify-center text-xs">
                  +
                </div>
                <span className="text-sm">Custom address…</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
