import React from 'react';
import { Button } from '@heroui/button';
import { useAccount, useConnect } from 'wagmi';
import { injected } from 'wagmi/connectors';
import { Wallet, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface ConnectWalletButtonProps {
    className?: string;
}

const ConnectWalletButton: React.FC<ConnectWalletButtonProps> = ({ className }) => {
    const { address, isConnected } = useAccount();
    const { connect, isPending: isConnecting } = useConnect();

    const { signOut } = useAuth();

    const handleConnect = () => {
        connect({ connector: injected() });
    };

    const handleDisconnect = () => {
        signOut();
    };

    // Truncate address for display: 0x1234...5678
    const truncateAddress = (addr: string) => {
        return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
    };

    if (isConnected && address) {
        return (
            <Button
                className={`bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-medium px-4 h-9 rounded-lg flex items-center gap-2 hover:from-emerald-600 hover:to-teal-600 transition-all ${className}`}
                onPress={handleDisconnect}
                startContent={<Wallet className="w-4 h-4" />}
                endContent={<LogOut className="w-3 h-3 opacity-70" />}
            >
                {truncateAddress(address)}
            </Button>
        );
    }

    return (
        <Button
            className={`bg-gradient-to-r from-violet-500 to-purple-600 text-white font-medium px-4 h-9 rounded-lg flex items-center gap-2 hover:from-violet-600 hover:to-purple-700 transition-all ${className}`}
            onPress={handleConnect}
            isLoading={isConnecting}
            startContent={!isConnecting && <Wallet className="w-4 h-4" />}
        >
            {isConnecting ? 'Connecting...' : 'Connect Wallet'}
        </Button>
    );
};

export default ConnectWalletButton;
