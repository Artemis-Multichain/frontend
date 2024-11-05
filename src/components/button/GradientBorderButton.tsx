import React from 'react';

const GradientBorderButton = ({ onClick, children }) => {
  return (
    <div className="relative inline-block mr-4">
      <div className="absolute -inset-[1px] bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-tilt max-w-[200px]"></div>
      <button
        onClick={onClick}
        className="relative px-3 py-2 bg-black rounded-lg leading-none flex items-center divide-x divide-gray-600"
      >
        <span className="flex items-center pl-4">
          <span className="pr-6 text-gray-100 text-sm">{children}</span>
        </span>
      </button>
    </div>
  );
};

export default GradientBorderButton;
