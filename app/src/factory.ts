import { useCallback, useState } from "react";
import { createPublicClient, createWalletClient, custom, http, type Address, type Hash } from "viem";
import { arcTestnet } from "./arc-chain";
import { FACTORY_ABI } from "./abi";

const FACTORY = import.meta.env.VITE_FACTORY_ADDRESS as Address;
const pc = () => createPublicClient({ chain: arcTestnet, transport: http() });
const wc = () => createWalletClient({ chain: arcTestnet, transport: custom(window.ethereum!) });

export function useFactory() {
  const [userContract, setUserContract] = useState<Address | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkContract = useCallback(async (address: Address) => {
    try {
      const addr = await pc().readContract({
        address: FACTORY,
        abi: FACTORY_ABI,
        functionName: "getUserContract",
        args: [address],
      });
      if (addr && addr !== "0x0000000000000000000000000000000000000000") {
        setUserContract(addr);
        return addr;
      }
      setUserContract(null);
      return null;
    } catch {
      setUserContract(null);
      return null;
    }
  }, []);

  const deploy = useCallback(async (): Promise<Address | null> => {
    setLoading(true);
    setError(null);
    try {
      const w = wc();
      const [addr] = await w.requestAddresses();
      const tx = await w.writeContract({
        address: FACTORY,
        abi: FACTORY_ABI,
        functionName: "deploy",
        account: addr,
      });
      const receipt = await pc().waitForTransactionReceipt({ hash: tx });
      const log = receipt.logs.find(
        (l) =>
          l.address.toLowerCase() === FACTORY.toLowerCase() &&
          l.topics[0] === "0xe0097bfdc48f05638a1eca990dfa260300be5447ceedc32fb2d9d26fc9f676e9",
      );
      if (log) {
        const deployed = `0x${log.topics[2]!.slice(26)}` as Address;
        setUserContract(deployed);
        return deployed;
      }
      throw new Error("Deploy event not found");
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      setError(msg);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { userContract, loading, error, checkContract, deploy, FACTORY };
}
