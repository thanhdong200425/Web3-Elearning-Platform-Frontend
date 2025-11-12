import React from 'react';
import { UserIcon } from './icons';

interface PersonalDetailsCardProps {
  email: string;
  phone: string;
  dateOfBirth: string;
  institution: string;
  major: string;
}

interface DetailFieldProps {
  label: string;
  value: string;
  className?: string;
}

const DetailField: React.FC<DetailFieldProps> = ({
  label,
  value,
  className = '',
}) => {
  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <p className="text-sm text-[#62748e]">{label}</p>
      <p className="text-base text-[#0f172b]">{value}</p>
    </div>
  );
};

const PersonalDetailsCard: React.FC<PersonalDetailsCardProps> = ({
  email,
  phone,
  dateOfBirth,
  institution,
  major,
}) => {
  return (
    <div className="bg-white border border-gray-200 rounded-[14px] overflow-hidden">
      {/* Header */}
      <div className="bg-slate-50 border-b border-gray-200 px-6 py-6">
        <div className="flex items-center gap-3">
          <UserIcon className="w-6 h-6 text-[#0f172b]" />
          <h2 className="text-base font-medium text-[#0f172b]">
            Personal Details
          </h2>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* First Row */}
          <DetailField label="Email" value={email} />
          <DetailField label="Phone" value={phone} />

          {/* Divider */}
          <div className="col-span-1 md:col-span-2 h-px bg-gray-200 my-2" />

          {/* Second Row */}
          <DetailField label="Date of Birth" value={dateOfBirth} />
          <DetailField label="Institution/School" value={institution} />

          {/* Divider */}
          <div className="col-span-1 md:col-span-2 h-px bg-gray-200 my-2" />

          {/* Third Row - Full Width */}
          <div className="col-span-1 md:col-span-2">
            <DetailField label="Major" value={major} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonalDetailsCard;

