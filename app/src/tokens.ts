import type { Address } from "viem";

export interface TokenInfo {
  name: string;
  symbol: string;
  address: Address;
  decimals: number;
}

export const COMMON_TOKENS: TokenInfo[] = [
  {
    name: "USD Coin",
    symbol: "USDC",
    address: "0x07865c6E87B9F70255377e024ace6630C1Eaa37F",
    decimals: 18,
  },
];

export const NATIVE_TOKEN: TokenInfo = {
  name: "USDC (Native)",
  symbol: "USDC",
  address: "0x0000000000000000000000000000000000000000",
  decimals: 18,
};
