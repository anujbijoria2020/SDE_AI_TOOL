import React from 'react';
import Spinner from './Spinner.tsx';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost' | 'icon';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  children,
  className = '',
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  disabled,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer';
  
  const variants = {
    primary: 'bg-accent text-white hover:bg-accent-hover active:bg-blue-800 shadow-sm',
    secondary: 'bg-hover-bg text-text-primary hover:bg-border-main active:bg-gray-300',
    outline: 'border border-border-main bg-transparent text-text-primary hover:bg-hover-bg active:bg-border-main',
    danger: 'bg-red-600 text-white hover:bg-red-700 active:bg-red-800 shadow-sm',
    ghost: 'bg-transparent text-text-muted hover:bg-hover-bg hover:text-text-primary active:bg-border-main',
    icon: 'bg-transparent text-text-muted hover:bg-hover-bg hover:text-text-primary active:bg-border-main rounded-md p-1.5',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-5 py-2.5 text-base',
    icon: 'p-2',
  };

  const currentSize = variant === 'icon' ? '' : sizes[size];

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${currentSize} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && <Spinner className="w-4 h-4 mr-2" />}
      {!isLoading && leftIcon && <span className="mr-2 inline-flex">{leftIcon}</span>}
      {children}
      {!isLoading && rightIcon && <span className="ml-2 inline-flex">{rightIcon}</span>}
    </button>
  );
};

export default Button;
