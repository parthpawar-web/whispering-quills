import React from 'react';

const Loader: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center p-8">
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 rounded-full border-4 border-[#ead5c9] opacity-35"></div>
        <div className="absolute inset-0 rounded-full border-4 border-t-[#c77966] animate-spin"></div>
      </div>
      <p className="text-xs text-[#7a4a3a] font-serif italic mt-3 animate-pulse">
        Turning pages...
      </p>
    </div>
  );
};

export default Loader;
