import React from 'react';

interface AssessmentCheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;    
  description: string;
}

const AssessmentCheckbox: React.FC<AssessmentCheckboxProps> = ({
  checked,
  onChange,
  label,
  description,
}) => {
  return (
    <div className="bg-slate-50 border border-slate-200 rounded-[10px] p-[17px]">
      <div className="flex items-start gap-3">
        <input
          type="checkbox"
          id="assessments"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="mt-0.5 w-4 h-4 rounded border border-black/10 bg-[#f3f3f5] text-[#0f172b] focus:ring-2 focus:ring-[#0f172b] cursor-pointer"
        />
        <div className="flex-1 flex flex-col gap-0.5">
          <label
            htmlFor="assessments"
            className="text-sm font-normal leading-[14px] text-[#0f172b] cursor-pointer"
          >
            {label}
          </label>
          <p className="text-sm font-normal leading-5 text-[#45556c]">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
};

export default AssessmentCheckbox;

