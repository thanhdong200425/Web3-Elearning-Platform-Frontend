import React from 'react';
import { Button } from '@heroui/button';
import { useAuth } from '@/contexts/AuthContext';
import { Shield, X } from 'lucide-react';

interface SignInModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const SignInModal: React.FC<SignInModalProps> = ({ isOpen, onClose }) => {
    const { signIn, isAuthenticating } = useAuth();

    const handleSignIn = async () => {
        try {
            await signIn();
        } catch (error) {
            console.error('Sign in error:', error);
        }
    };

    const handleSkip = () => {
        onClose();
    };

    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
                onClick={handleSkip}
            />

            {/* Modal */}
            <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
                <div
                    className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative animate-in fade-in zoom-in duration-200"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Close button */}
                    <button
                        onClick={handleSkip}
                        className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>

                    {/* Icon */}
                    <div className="flex justify-center mb-6">
                        <div className="w-16 h-16 bg-gradient-to-br from-violet-500 to-purple-600 rounded-full flex items-center justify-center">
                            <Shield className="w-8 h-8 text-white" />
                        </div>
                    </div>

                    {/* Content */}
                    <h2 className="text-xl font-semibold text-center text-gray-900 mb-2">
                        Xác thực ví của bạn
                    </h2>
                    <p className="text-gray-600 text-center mb-6 text-sm">
                        Để bảo mật tốt hơn, vui lòng ký một message để xác minh bạn là chủ sở hữu ví này.
                        Hành động này hoàn toàn miễn phí và không tiêu tốn gas.
                    </p>

                    {/* Info box */}
                    <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-6">
                        <h3 className="font-medium text-blue-900 text-sm mb-2">Bạn sẽ ký gì?</h3>
                        <ul className="text-blue-800 text-xs space-y-1">
                            <li>• Domain: {window.location.host}</li>
                            <li>• Hết hạn: 24 giờ sau khi ký</li>
                            <li>• Mục đích: Xác minh quyền sở hữu ví</li>
                        </ul>
                    </div>

                    {/* Buttons */}
                    <div className="flex flex-col gap-3">
                        <Button
                            className="w-full bg-gradient-to-r from-violet-500 to-purple-600 text-white font-medium h-11 rounded-lg hover:from-violet-600 hover:to-purple-700 transition-all"
                            onPress={handleSignIn}
                            isLoading={isAuthenticating}
                            startContent={!isAuthenticating && <Shield className="w-4 h-4" />}
                        >
                            {isAuthenticating ? 'Đang chờ ký...' : 'Ký để xác thực'}
                        </Button>

                        <Button
                            variant="light"
                            className="w-full text-gray-600 font-medium h-10"
                            onPress={handleSkip}
                            isDisabled={isAuthenticating}
                        >
                            Bỏ qua lần này
                        </Button>
                    </div>

                    {/* Footer note */}
                    <p className="text-xs text-gray-400 text-center mt-4">
                        Bạn có thể ký bất cứ lúc nào bằng cách click vào nút ví.
                    </p>
                </div>
            </div>
        </>
    );
};

export default SignInModal;
