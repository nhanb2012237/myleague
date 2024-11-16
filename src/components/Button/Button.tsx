import React from 'react';
import { Button as MaterialButton } from '@material-tailwind/react';

export default function Button({
  variant = 'default',
  size = 'auto',
  type = 'button',
  onClick,
  children,
  icon,
  isOnlyIcon,
  className,
}: {
  variant?:
    | 'primary'
    | 'red'
    | 'default'
    | 'white'
    | 'dark'
    | 'icon'
    | 'facebook';
  size?: 'full' | 'auto';
  type?: 'button' | 'submit' | 'reset';
  onClick?: () => void;
  children?: React.ReactNode;
  icon?: React.ReactNode;
  isOnlyIcon?: boolean;
  className?: string;
}) {
  const baseClasses =
    'rounded-md text-heading-s-variant transition duration-200 ease-in-out flex items-center justify-center md:space-x-1';
  const paddingClasses = isOnlyIcon
    ? 'px-2 py-4'
    : icon
    ? 'p-2 pr-4'
    : 'py-3 px-3 md:px-5';

  const variantClasses = {
    primary: 'text-white bg-navy-700 hover:bg-brand-600',
    red: 'text-white bg-red-600 hover:bg-red-light',
    default:
      'text-blue-gray bg-gray-200 hover:bg-gray-300 dark:text-gray-light dark:bg-dark-medium dark:hover:bg-white',
    dark: 'text-gray-medium bg-[#373B53] hover:bg-dark-darkest dark:text-gray-light hover:dark:bg-dark-light',
    white:
      'text-dark bg-white hover:bg-black/5 dark:text-white dark:bg-dark-medium dark:hover:bg-dark-light p-3',
    icon: 'text-gray-medium hover:text-red-medium',
    facebook: 'bg- text-white hover:bg-facebook/80 p-3',
  };

  const sizeClasses = {
    full: 'w-full',
    auto: '',
  };

  return (
    <MaterialButton
      type={type}
      className={`${baseClasses} ${paddingClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      onClick={onClick}
    >
      {icon && <span className={isOnlyIcon ? '' : 'mr-2'}>{icon}</span>}
      {!isOnlyIcon && <span>{children}</span>}
    </MaterialButton>
  );
}
