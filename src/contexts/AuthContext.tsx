import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { useAccount, useDisconnect, useSignMessage } from 'wagmi';
import { SiweMessage } from 'siwe';
import { addToast } from "@heroui/toast";

// Constants
const SIWE_SESSION_KEY = 'siwe_session';
const SESSION_EXPIRY_HOURS = 24;
const SKIP_STATE_KEY = 'auth_skip_state';

// Types
interface SiweSession {
    address: string;
    chainId: number;
    message: string;
    signature: string;
    expiresAt: number;
}

interface AuthContextType {
    isAuthenticated: boolean;
    isAuthenticating: boolean;
    session: SiweSession | null;
    signIn: () => Promise<void>;
    signOut: () => void;
    showSignInModal: boolean;
    setShowSignInModal: (show: boolean) => void;
    hasSkipped: boolean;
    setHasSkipped: (skipped: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper functions
const getStoredSession = (): SiweSession | null => {
    try {
        const stored = localStorage.getItem(SIWE_SESSION_KEY);
        if (!stored) return null;

        const session: SiweSession = JSON.parse(stored);

        // Check if session is expired
        if (Date.now() > session.expiresAt) {
            localStorage.removeItem(SIWE_SESSION_KEY);
            return null;
        }

        return session;
    } catch {
        localStorage.removeItem(SIWE_SESSION_KEY);
        return null;
    }
};

const storeSession = (session: SiweSession): void => {
    localStorage.setItem(SIWE_SESSION_KEY, JSON.stringify(session));
};

const clearSession = (): void => {
    localStorage.removeItem(SIWE_SESSION_KEY);
};

const getSkipState = (): boolean => {
    return localStorage.getItem(SKIP_STATE_KEY) === 'true';
};

const setSkipState = (skipped: boolean): void => {
    if (skipped) {
        localStorage.setItem(SKIP_STATE_KEY, 'true');
    } else {
        localStorage.removeItem(SKIP_STATE_KEY);
    }
};

// Generate nonce for SIWE message
const generateNonce = (): string => {
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

// AuthProvider Component
interface AuthProviderProps {
    children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
    const { address, isConnected, chainId } = useAccount();
    const { disconnect } = useDisconnect();
    const { signMessageAsync, isPending: isSigningMessage } = useSignMessage();

    const [session, setSession] = useState<SiweSession | null>(null);
    const [isAuthenticating, setIsAuthenticating] = useState(false);
    const [showSignInModal, setShowSignInModal] = useState(false);
    const [hasSkipped, setHasSkippedState] = useState<boolean>(() => getSkipState());
    const [hasCheckedStoredSession, setHasCheckedStoredSession] = useState(false);

    // Wrapper to sync with localStorage
    const setHasSkipped = useCallback((skipped: boolean) => {
        setSkipState(skipped);
        setHasSkippedState(skipped);
    }, []);

    // Check for existing session on mount and when address changes
    useEffect(() => {
        const storedSession = getStoredSession();

        if (storedSession && isConnected && address) {
            // Verify the session matches current wallet
            if (storedSession.address.toLowerCase() === address.toLowerCase()) {
                setSession(storedSession);
                setHasSkipped(false); // Clear skip state if authenticated
            } else {
                // Address mismatch, clear session
                clearSession();
                setSession(null);
            }
        } else if (!isConnected) {
            // Wallet disconnected, clear session and skip state
            clearSession();
            setSession(null);
            setHasSkipped(false);
        }

        // Mark that we've checked for stored session
        setHasCheckedStoredSession(true);
    }, [address, isConnected, setHasSkipped]);

    const [preventSignInPrompt, setPreventSignInPrompt] = useState(false);

    // Auto-prompt sign-in when wallet connects but not authenticated
    useEffect(() => {
        if (preventSignInPrompt) return;

        // Only show modal after we've checked for stored session
        if (!hasCheckedStoredSession) return;

        if (isConnected && address && !session && !isAuthenticating) {
            setShowSignInModal(true);
        }
    }, [isConnected, address, session, isAuthenticating, preventSignInPrompt, hasCheckedStoredSession]);

    // Reset prevention flag when disconnected
    useEffect(() => {
        if (!isConnected) {
            setPreventSignInPrompt(false);
        }
    }, [isConnected]);

    // Check session expiry periodically
    useEffect(() => {
        if (!session) return;

        const checkExpiry = () => {
            if (Date.now() > session.expiresAt) {
                console.log('Session expired, clearing...');
                clearSession();
                setSession(null);
                addToast({
                    title: "Session Expired",
                    description: "Your session has expired. Please sign in again.",
                    color: "warning"
                });
            }
        };

        const interval = setInterval(checkExpiry, 60 * 1000); // Check every minute
        return () => clearInterval(interval);
    }, [session]);

    const signIn = useCallback(async () => {
        if (!address || !chainId) {
            throw new Error('Wallet not connected');
        }

        setIsAuthenticating(true);

        try {
            const nonce = generateNonce();
            const expiresAt = Date.now() + (SESSION_EXPIRY_HOURS * 60 * 60 * 1000);
            const expirationTime = new Date(expiresAt).toISOString();

            // Create SIWE message
            const siweMessage = new SiweMessage({
                domain: window.location.host,
                address: address,
                statement: 'Sign in to Web3 Learning Platform to verify your wallet ownership.',
                uri: window.location.origin,
                version: '1',
                chainId: chainId,
                nonce: nonce,
                expirationTime: expirationTime,
            });

            const message = siweMessage.prepareMessage();

            // Request signature from wallet
            const signature = await signMessageAsync({ message });

            // Verify signature client-side
            const verifiedMessage = new SiweMessage(message);
            await verifiedMessage.verify({
                signature,
                domain: window.location.host,
            });

            // Create and store session
            const newSession: SiweSession = {
                address,
                chainId,
                message,
                signature,
                expiresAt,
            };

            storeSession(newSession);
            setSession(newSession);
            setShowSignInModal(false);
            setHasSkipped(false); // Clear skip state on successful sign-in

            console.log('✅ SIWE authentication successful');
        } catch (error) {
            console.error('❌ SIWE authentication failed:', error);
            throw error;
        } finally {
            setIsAuthenticating(false);
        }
    }, [address, chainId, signMessageAsync]);

    const signOut = useCallback(() => {
        setPreventSignInPrompt(true);
        clearSession();
        setSession(null);
        setHasSkipped(false);
        disconnect();
        console.log('👋 Signed out successfully');
    }, [disconnect, setHasSkipped]);

    const isAuthenticated = !!session && !!isConnected &&
        session.address.toLowerCase() === address?.toLowerCase();

    const value: AuthContextType = {
        isAuthenticated,
        isAuthenticating: isAuthenticating || isSigningMessage,
        session,
        signIn,
        signOut,
        showSignInModal,
        setShowSignInModal,
        hasSkipped,
        setHasSkipped,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

// Custom hook to use auth context
export function useAuth(): AuthContextType {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

export default AuthContext;
