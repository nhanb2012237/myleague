import React from 'react';

interface SpinnerProps {
  size?: 'small' | 'medium' | 'large';
}

const Spinner: React.FC<SpinnerProps> = ({ size = 'medium' }) => {
  const sizeClasses = {
    small: 'h-4 w-4',
    medium: 'h-6 w-6',
    large: 'h-10 w-10',
  };

  return (
    <div className={`flex items-center justify-center`}>
      <div
        className={`animate-spin rounded-full border-4 border-gray-300 border-t-blue-500 ${sizeClasses[size]}`}
      ></div>
    </div>
  );
};

export default Spinner;
