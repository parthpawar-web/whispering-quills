import React from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  isLoading?: boolean;
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  isLoading = false,
  children,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles = 'flex items-center justify-center gap-2 px-5 py-2.5 rounded-full font-semibold text-sm transition-all focus:outline-none focus:ring-2 disabled:opacity-75 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98]';

  const variants = {
    primary: 'bg-gradient-to-r from-[#c77966] to-[#d99b8a] text-white shadow-md hover:shadow-lg focus:ring-[#d99b8a]',
    secondary: 'bg-[#fff7ef] text-[#7a4a3a] border border-[#ead5c9] hover:bg-[#f7eadc] focus:ring-[#ead5c9]',
    outline: 'bg-transparent text-[#c77966] border border-[#c77966] hover:bg-[#c77966] hover:text-white focus:ring-[#c77966]',
    danger: 'bg-red-500 text-white shadow-md hover:bg-red-600 focus:ring-red-500',
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${className}`}
      disabled={disabled || isLoading}
      style={{ fontFamily: "'Poppins', sans-serif" }}
      {...props}
    >
      {isLoading && <Loader2 size={16} className="animate-spin" />}
      {children}
    </button>
  );
};

export default Button;
