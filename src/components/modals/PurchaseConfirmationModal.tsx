import React from "react";
import { Button } from "@heroui/button";
import { X, Loader2, CheckCircle2, AlertCircle, ShoppingCart } from "lucide-react";
import { OnChainCourse } from "@/types/courseTypes";
import { formatEther } from "viem";

interface PurchaseConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  courseData: OnChainCourse | undefined;
  isPurchasing: boolean;
  isSuccess: boolean;
  error: Error | null;
}

const PurchaseConfirmationModal: React.FC<PurchaseConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  courseData,
  isPurchasing,
  isSuccess,
  error,
}) => {
  if (!isOpen || !courseData) return null;

  const priceInEth = formatEther(courseData.price);
  const isFree = courseData.price === 0n;

  const handleClose = () => {
    if (!isPurchasing) {
      onClose();
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        className="fixed inset-0 flex items-center justify-center z-50 p-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div
          className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative animate-in fade-in zoom-in duration-200"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          {!isPurchasing && (
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          )}

          {/* Success State */}
          {isSuccess && (
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle2 className="w-10 h-10 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Purchase Successful!
              </h3>
              <p className="text-gray-600 mb-6">
                You now have access to {courseData.title}. Redirecting to course...
              </p>
            </div>
          )}

          {/* Error State */}
          {error && !isSuccess && (
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <AlertCircle className="w-10 h-10 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Purchase Failed
              </h3>
              <p className="text-gray-600 mb-6">
                {error.message || "An error occurred during the purchase. Please try again."}
              </p>
              <Button
                onPress={handleClose}
                className="w-full bg-gray-600 text-white rounded-lg h-10"
              >
                Close
              </Button>
            </div>
          )}

          {/* Purchasing State */}
          {isPurchasing && !isSuccess && !error && (
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Processing Purchase...
              </h3>
              <p className="text-gray-600 mb-2">
                Please confirm the transaction in your wallet
              </p>
              <p className="text-gray-500 text-sm">
                This may take a few moments
              </p>
            </div>
          )}

          {/* Confirmation State */}
          {!isPurchasing && !isSuccess && !error && (
            <>
              <div className="text-center mb-6">
                <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <ShoppingCart className="w-10 h-10 text-blue-600" />
                </div>
                <h3
                  id="modal-title"
                  className="text-xl font-semibold text-gray-900 mb-2"
                >
                  {isFree ? "Enroll in Course" : "Confirm Purchase"}
                </h3>
                <p className="text-gray-600">
                  {isFree
                    ? "Enroll in this free course to get started"
                    : "You are about to purchase the following course"}
                </p>
              </div>

              {/* Course Details */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h4 className="font-semibold text-gray-900 mb-3">
                  {courseData.title}
                </h4>

                {!isFree && (
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Course Price</span>
                      <span className="font-semibold text-gray-900">
                        {priceInEth} ETH
                      </span>
                    </div>
                    <div className="border-t border-gray-200 pt-2 flex justify-between items-center">
                      <span className="font-semibold text-gray-900">Total</span>
                      <span className="font-bold text-blue-600 text-lg">
                        {priceInEth} ETH
                      </span>
                    </div>
                  </div>
                )}

                {isFree && (
                  <p className="text-green-600 font-semibold">Free Course</p>
                )}
              </div>

              {/* Benefits */}
              <div className="bg-blue-50 rounded-lg p-4 mb-6">
                <p className="text-sm text-blue-900 font-medium mb-2">
                  What you'll get:
                </p>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Lifetime access to course content</li>
                  <li>• Certificate of completion</li>
                  <li>• Blockchain-verified ownership</li>
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button
                  onPress={handleClose}
                  className="flex-1 bg-white border border-gray-200 text-gray-700 rounded-lg h-10"
                >
                  Cancel
                </Button>
                <Button
                  onPress={onConfirm}
                  className="flex-1 bg-blue-600 text-white rounded-lg h-10"
                >
                  {isFree ? "Enroll Now" : "Confirm Purchase"}
                </Button>
              </div>

              {!isFree && (
                <p className="text-xs text-gray-500 text-center mt-4">
                  By purchasing, you agree to our terms of service
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default PurchaseConfirmationModal;
