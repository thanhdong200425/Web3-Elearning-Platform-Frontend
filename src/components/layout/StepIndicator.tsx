import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@heroui/button";

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
  steps: Array<{
    number: number;
    title: string;
    isActive: boolean;
    isCompleted: boolean;
  }>;
}

const StepIndicator: React.FC<StepIndicatorProps> = ({
  currentStep,
  totalSteps,
  steps,
}) => {
  const navigate = useNavigate();

  return (
    <div className="w-64 bg-white border-r border-gray-200 p-6 h-screen flex flex-col">
      <div className="flex flex-col gap-2">
        <h2 className="font-medium text-base text-neutral-950">Course Setup</h2>
        <p className="font-normal text-sm text-gray-500">
          Step {currentStep} of {totalSteps}
        </p>
      </div>

      <div className="flex flex-col gap-4 mt-6 flex-1">
        {steps.map((step, index) => (
          <div key={step.number} className="flex gap-3 items-start">
            {/* Step Circle */}
            <div
              className={`w-8 h-8 rounded-full border-2 flex items-center justify-center shrink-0 ${
                step.isActive
                  ? "bg-blue-50 border-blue-500"
                  : step.isCompleted
                    ? "bg-blue-50 border-blue-500"
                    : "bg-white border-gray-300"
              }`}
            >
              <span
                className={`text-sm font-medium ${
                  step.isActive || step.isCompleted
                    ? "text-blue-500"
                    : "text-gray-400"
                }`}
              >
                {step.number}
              </span>
            </div>

            {/* Step Content */}
            <div className="flex-1 min-w-0">
              <p
                className={`text-sm ${
                  step.isActive || step.isCompleted
                    ? "text-gray-900"
                    : "text-gray-400"
                }`}
              >
                {step.title}
              </p>

              {/* Connecting Line */}
              {index < steps.length - 1 && (
                <div className="w-0.5 h-8 bg-gray-200 ml-3 mt-2" />
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Back to Home Button */}
      <Button
        onClick={() => navigate("/")}
        variant="bordered"
        className="w-full mt-6"
        startContent={
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
        }
      >
        Back to Home
      </Button>
    </div>
  );
};

export default StepIndicator;
