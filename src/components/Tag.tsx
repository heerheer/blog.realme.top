
import React from 'react';

interface TagProps {
  label: string;
  active?: boolean;
  onClick?: () => void;
}

const Tag: React.FC<TagProps> = ({ label, active, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1 text-xs font-medium rounded-full transition-all duration-200 border ${
        active 
          ? 'bg-slate-900 text-white border-slate-900 shadow-sm' 
          : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'
      }`}
    >
      #{label}
    </button>
  );
};

export default Tag;
