import React from "react";

interface SpecItemProps {
  label: string;
  value: string;
}

export const SpecItem = ({ label, value }: SpecItemProps) => {
  return (
    <div className="flex items-center gap-2">
      <span className="text-gray-400">{label}:</span>
      <span className="font-medium text-gray-200">{value}</span>
    </div>
  );
};
