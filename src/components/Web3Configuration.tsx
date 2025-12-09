import React, { useEffect } from 'react';
import { UseFormRegister, FieldErrors } from 'react-hook-form';
import { CourseFormData, tokenOptions } from '../schemas/courseForm';
import { Input } from '@heroui/input';
import { Select, SelectItem } from '@heroui/select';
import { Button } from '@heroui/button';
import { injected, useAccount, useConnect, useDisconnect } from 'wagmi';

interface Web3ConfigurationProps {
  register: UseFormRegister<CourseFormData>;
  errors: FieldErrors<CourseFormData>;
  coursePrice: number;
  setValue?: (field: keyof CourseFormData, value: any) => void;
}

const Web3Configuration: React.FC<Web3ConfigurationProps> = ({
  register,
  errors,
  coursePrice,
  setValue,
}) => {
  const platformFee = 0.05; // 5%
  const platformFeeAmount = coursePrice * platformFee;
  const revenue = coursePrice - platformFeeAmount;
  const { connect } = useConnect();
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();

  // Update wallet address in form when connected
  useEffect(() => {
    if (address && setValue) {
      setValue('walletAddress', address);
    }
  }, [address, setValue]);

  const handleConnectWallet = () => {
    connect({ connector: injected() });
  };

  const handleDisconnectWallet = () => {
    disconnect();
    if (setValue) {
      setValue('walletAddress', '');
    }
  };

  return (
    <div className="flex flex-col gap-6 h-full">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-medium text-neutral-950">
          Web3 Configuration & Pricing
        </h1>
        <p className="text-base text-gray-600">
          Configure payment settings and pricing for your course
        </p>
      </div>

      {/* Alert */}
      <div className="bg-white border border-gray-200 rounded-[10px] p-4 flex items-center gap-3">
        <div className="w-4 h-4 flex-shrink-0">
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M8 1L15 14H1L8 1Z"
              stroke="#717182"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M8 6V9"
              stroke="#717182"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M8 11H8.01"
              stroke="#717182"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <p className="text-sm text-gray-600">
          This course will be registered on the blockchain. Students will pay using cryptocurrency tokens.
        </p>
      </div>

      {/* Form Fields */}
      <div className="flex flex-col gap-4 flex-1">
        <div>
          {!isConnected ? <Button className='bg-black text-white font-semibold' onPress={handleConnectWallet}>Connect Wallet</Button> : <Button className='bg-black text-white font-semibold' onPress={handleDisconnectWallet}>Disconnect wallet</Button>}
        </div>

        {/* Payment Token */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-neutral-950">
            Payment Token
          </label>
          <Select
            {...register('paymentToken')}
            placeholder="Select token"
            isInvalid={!!errors.paymentToken}
            errorMessage={errors.paymentToken?.message}
            classNames={{
              trigger: "bg-gray-100 border-0 rounded-lg px-3 py-2",
            }}
          >
            {tokenOptions.map((option) => (
              <SelectItem key={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </Select>
        </div>

        {/* Course Price */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-neutral-950">
            Course Price
          </label>
          <div className="relative">
            <Input
              {...register('coursePrice', { valueAsNumber: true })}
              type="number"
              step="0.01"
              placeholder="0.00"
              isInvalid={!!errors.coursePrice}
              errorMessage={errors.coursePrice?.message}
              classNames={{
                input: "bg-gray-100 border-0 rounded-lg pr-16",
                inputWrapper: "bg-gray-100 border-0 rounded-lg px-3 py-2",
              }}
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-500">
              USDC
            </div>
          </div>
        </div>

        {/* Wallet Address */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-neutral-950">
            Wallet Address
          </label>
          <Input
            {...register('walletAddress')}
            placeholder="Your wallet address"
            value={address ?? ''}
            disabled={!isConnected}
            isInvalid={!!errors.walletAddress}
            errorMessage={errors.walletAddress?.message}
            classNames={{
              input: "bg-gray-50 border-0 rounded-lg",
              inputWrapper: "bg-gray-50 border-0 rounded-lg px-3 py-2",
            }}
          />
          <p className={`text-sm text-gray-500 ${isConnected ? 'text-green-600' : 'text-red-600'}`}>
            {isConnected ? `Connected wallet` : 'Not connected'}
          </p>
        </div>

        {/* Pricing Summary */}
        <div className="bg-gray-50 rounded-[10px] p-4 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-base text-gray-700">Course Price</span>
            <span className="text-base font-medium text-neutral-950">
              {coursePrice.toFixed(2)} USDC
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-base text-gray-700">Platform Fee</span>
            <span className="text-base font-medium text-red-600">
              -{platformFeeAmount.toFixed(2)} USDC
            </span>
          </div>
          <div className="border-t border-gray-200 pt-3 flex justify-between items-center">
            <span className="text-base font-medium text-neutral-950">
              Your Revenue (per sale)
            </span>
            <span className="text-base font-medium text-green-600">
              {revenue.toFixed(2)} USDC
            </span>
          </div>
        </div>

        {/* Platform Fee Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-[10px] p-4 flex items-center gap-3">
          <div className="w-4 h-4 flex-shrink-0">
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M8 1L15 14H1L8 1Z"
                stroke="#1c398e"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M8 6V9"
                stroke="#1c398e"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M8 11H8.01"
                stroke="#1c398e"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <p className="text-sm text-blue-800">
            Platform fee of 5% helps maintain the decentralized infrastructure and IPFS storage.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Web3Configuration;
