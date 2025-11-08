import React from 'react';
import { Button } from '@heroui/button';

interface SuggestionChipProps {
  label: string;
  onClick: () => void;
}

const SuggestionChip: React.FC<SuggestionChipProps> = ({ label, onClick }) => {
  return (
    <Button
      onPress={onClick}
      size="sm"
      variant="light"
      className="bg-slate-100 px-3 py-1 rounded-lg text-xs font-normal leading-4 text-[#314158] hover:bg-slate-200 h-auto min-w-0"
      radius="lg"
    >
      {label}
    </Button>
  );
};

export default SuggestionChip;

