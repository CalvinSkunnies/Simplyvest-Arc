import { useCallback, useState } from "react";
import {
  createPublicClient,
  createWalletClient,
  custom,
  http,
  type Address,
} from "viem";
import { arcTestnet } from "./arc-chain";
import { FACTORY_ABI } from "./abi";

const FACTORY = import.meta.env.VITE_FACTORY_ADDRESS as Address;

function publicClient() {
  return createPublicClient({ chain: arcTestnet, transport: http() });
}

function walletClient() {
  return createWalletClient({
    chain: arcTestnet,
    transport: custom(window.ethereum!),
  });
}

export function useFactory() {
  const [userContract, setUserContract] = useState<Address | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const check = useCallback(async (address: Address) => {
    if (!FACTORY || FACTORY === "0x" + "0".repeat(40)) {
      setError("Factory not deployed - set VITE_FACTORY_ADDRESS in .env");
      return;
    }
    try {
      const contract = await publicClient().readContract({
        address: FACTORY,
        abi: FACTORY_ABI,
        functionName: "getUserContract",
        args: [address],
      });
      setUserContract(contract === "0x0000000000000000000000000000000000000000" ? null : contract);
    } catch {
      setUserContract(null);
    }
  }, []);

  const deploy = useCallback(async (): Promise<Address | undefined> => {
    setLoading(true);
    setError(null);
    try {
      const wc = walletClient();
      const [addr] = await wc.requestAddresses();
      const tx = await wc.writeContract({
        address: FACTORY,
        abi: FACTORY_ABI,
        functionName: "deploy",
        account: addr,
      });
      const receipt = await publicClient().waitForTransactionReceipt({ hash: tx });
      const deployed = receipt.contractAddress;
      if (deployed) {
        setUserContract(deployed);
        return deployed;
      }
    } catch (e: any) {
      setError(e?.message ?? "Deploy failed");
    } finally {
      setLoading(false);
    }
  }, []);

  return { userContract, loading, error, check, deploy };
}
