import React from 'react';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'rect' | 'circle';
}

const Skeleton: React.FC<SkeletonProps> = ({ className = '', variant = 'rect' }) => {
  const base = 'animate-pulse bg-gray-200 dark:bg-gray-700';
  
  const variants = {
    text: 'h-4 rounded w-3/4 my-2',
    rect: 'rounded-md',
    circle: 'rounded-full',
  };

  return <div className={`${base} ${variants[variant]} ${className}`} />;
};

export default Skeleton;
