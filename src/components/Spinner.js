import React from 'react';
import { useTheme } from '../context/ThemeContext';

const Spinner = ({ size = 40 }) => {
  const { isDarkMode } = useTheme();
  return (
    <div className="flex flex-col items-center justify-center">
      <svg
        className="animate-spin"
        width={size}
        height={size}
        viewBox="0 0 50 50"
        style={{ display: 'block' }}
      >
        <circle
          cx="25"
          cy="25"
          r="20"
          fill="none"
          stroke={isDarkMode ? '#4fd1c5' : '#2563eb'}
          strokeWidth="5"
          strokeDasharray="31.4 31.4"
          strokeLinecap="round"
        />
      </svg>
      <span className={`mt-2 text-base font-medium ${isDarkMode ? 'text-white' : 'text-gray-700'}`}>載入中...</span>
    </div>
  );
};

export default Spinner; 