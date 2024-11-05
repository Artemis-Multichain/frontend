'use client'

import React, { useState } from 'react';

interface RangeSliderProps {
  count: string;
  cfg: string;
}

const RangeSlider: React.FC<RangeSliderProps> = ({ count, cfg }) => {
  const [value, setValue] = useState<number>(50);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setValue(Number(event.target.value));
  };

  const sliderStyle = {
    '--slider-value': `${value}%`,
  } as React.CSSProperties;

  return (
    <div className="flex items-center gap-4">
      <div className="w-full flex items-center py-6">
        <input
          type="range"
          min="0"
          max="100"
          value={value}
          onChange={handleChange}
          className="range-slider"
          style={sliderStyle}
        />
      </div>

      <div>
        <h1
          className={`text-white text-sm p-2 border-gray-800 border-[1px] rounded-xl ${count}`}
        >
          {value}
        </h1>
      </div>

      <div>
        <h1
          className={`text-white p-2 border-gray-800 border-[1px] rounded-xl ${cfg}`}
        >
          7
        </h1>
      </div>
    </div>
  );
};

export default RangeSlider;
