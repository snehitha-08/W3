import React from 'react';

const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex justify-center items-center p-16" role="status" aria-label="Loading content">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#5E6D55] dark:border-[#a6c19a]"></div>
    </div>
  );
};

export default LoadingSpinner;
