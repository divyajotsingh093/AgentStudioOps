import React, { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { useViewport } from '@/hooks/use-viewport';

interface ResponsiveContainerProps {
  children: ReactNode;
  className?: string;
  fluid?: boolean;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  padding?: boolean;
}

const maxWidthClasses = {
  sm: 'max-w-screen-sm',
  md: 'max-w-screen-md',
  lg: 'max-w-screen-lg',
  xl: 'max-w-screen-xl',
  '2xl': 'max-w-screen-2xl',
  full: 'max-w-full',
};

/**
 * A responsive container component that adjusts width based on screen size
 */
const ResponsiveContainer: React.FC<ResponsiveContainerProps> = ({
  children,
  className,
  fluid = false,
  maxWidth = 'xl',
  padding = true,
}) => {
  const { screenSize } = useViewport();

  return (
    <div
      className={cn(
        'mx-auto w-full',
        // Apply max-width constraint unless fluid is true
        !fluid && maxWidthClasses[maxWidth],
        // Apply padding based on screen size
        padding && screenSize === 'xs' && 'px-2',
        padding && screenSize === 'sm' && 'px-4',
        padding && (screenSize === 'md' || screenSize === 'lg') && 'px-6',
        padding && (screenSize === 'xl' || screenSize === '2xl') && 'px-8',
        className
      )}
    >
      {children}
    </div>
  );
};

export default ResponsiveContainer;