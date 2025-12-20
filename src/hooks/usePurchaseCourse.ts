import { useWriteContract, useWaitForTransactionReceipt, useAccount } from "wagmi";
import { elearningPlatformAddress, elearningPlatformABI } from "@/contracts/ElearningPlatform";

export const usePurchaseCourse = () => {
  const { address, isConnected } = useAccount();
  const {
    data: hash,
    writeContract,
    isPending: isWritePending,
    isSuccess: isWriteSuccess,
    error: writeError,
  } = useWriteContract();

  const {
    isLoading: isConfirming,
    isSuccess: isConfirmed,
    error: confirmError,
  } = useWaitForTransactionReceipt({
    hash,
  });

  const purchaseCourse = (courseId: bigint, price: bigint) => {
    if (!isConnected || !address) {
      throw new Error("Please connect your wallet first");
    }

    writeContract({
      address: elearningPlatformAddress,
      abi: elearningPlatformABI,
      functionName: "purchaseCourse",
      args: [courseId],
      value: price, // Send the course price in Wei
    });
  };

  return {
    purchaseCourse,
    hash,
    isPending: isWritePending || isConfirming,
    isSuccess: isWriteSuccess && isConfirmed,
    error: writeError || confirmError,
    isConnected,
  };
};
