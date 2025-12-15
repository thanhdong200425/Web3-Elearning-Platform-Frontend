import React from 'react';
import { LucideIcon } from 'lucide-react';
import { Button } from '@heroui/button';

interface ContentFormatCardProps {
    icon: LucideIcon;
    title: string;
    description: string;
    isSelected: boolean;
    onSelect: () => void;
}

const ContentFormatCard: React.FC<ContentFormatCardProps> = ({
    icon: Icon,
    title,
    description,
    isSelected,
    onSelect,
}) => {
    return (
        <Button
            onPress={onSelect}
            variant="bordered"
            radius="lg"
            className={`relative border-2 rounded-[10px] h-[82px] px-4 py-5 flex items-center gap-4 transition-all justify-start w-full ${isSelected
                    ? 'bg-slate-50 border-[#0f172b]'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
        >
            <div className="bg-slate-100 rounded-[10px] w-10 h-10 flex items-center justify-center shrink-0">
                <Icon className="w-5 h-5 text-[#0f172b]" />
            </div>
            <div className="flex-1 flex flex-col gap-0.5 items-start">
                <h3 className="text-base font-normal leading-6 text-[#0f172b]">
                    {title}
                </h3>
                <p className="text-sm font-normal leading-5 text-[#45556c]">
                    {description}
                </p>
            </div>
            {isSelected && (
                <div className="bg-[#0f172b] rounded-full w-5 h-5 flex items-center justify-center shrink-0">
                    <svg
                        className="w-3 h-3 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                        />
                    </svg>
                </div>
            )}
        </Button>
    );
};

export default ContentFormatCard;

