import { useAccount } from "wagmi";

export const checkWalletConnection = (): boolean => {
  const { isConnected } = useAccount();
  return isConnected;
};
