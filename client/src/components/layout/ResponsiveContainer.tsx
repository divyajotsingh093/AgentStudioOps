import React from 'react';
import { cn } from '@/lib/utils';
import { useResponsive } from '@/hooks/use-responsive';

interface ResponsiveContainerProps {
  children: React.ReactNode;
  className?: string;
  fullWidth?: boolean;  // Whether to take full width on all screens
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';  // Maximum width on larger screens
  padding?: 'none' | 'sm' | 'md' | 'lg';  // Padding size
  preserveHeight?: boolean;  // Whether to preserve height on smaller screens
}

/**
 * Responsive container component that adapts to different screen sizes
 */
export function ResponsiveContainer({
  children,
  className,
  fullWidth = false,
  maxWidth = 'xl',
  padding = 'md',
  preserveHeight = false,
}: ResponsiveContainerProps) {
  const { isMobile, isTablet } = useResponsive();
  
  // Determine max-width class
  const maxWidthClass = fullWidth
    ? 'w-full'
    : maxWidth === 'sm'
      ? 'max-w-screen-sm'
      : maxWidth === 'md'
        ? 'max-w-screen-md'
        : maxWidth === 'lg'
          ? 'max-w-screen-lg'
          : maxWidth === 'xl'
            ? 'max-w-screen-xl'
            : maxWidth === '2xl'
              ? 'max-w-screen-2xl'
              : 'w-full';
  
  // Determine padding class
  const paddingClass = padding === 'none'
    ? 'px-0'
    : padding === 'sm'
      ? 'px-2 sm:px-3 md:px-4'
      : padding === 'lg'
        ? 'px-4 sm:px-6 md:px-8'
        : 'px-3 sm:px-4 md:px-6'; // default 'md' padding
  
  return (
    <div
      className={cn(
        'mx-auto', // center the container
        maxWidthClass,
        paddingClass,
        // Apply reduced height on mobile if not preserving height
        isMobile && !preserveHeight ? 'max-h-[85vh]' : '',
        // Apply appropriate overflow behavior
        'overflow-x-hidden',
        // Pass additional classes
        className
      )}
    >
      {children}
    </div>
  );
}

/**
 * Responsive grid component that adapts to different screen sizes
 */
export function ResponsiveGrid({
  children,
  className,
  columns = { xs: 1, sm: 2, md: 3, lg: 4 },
  gap = 'md',
}: {
  children: React.ReactNode;
  className?: string;
  columns?: {
    xs?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
    '2xl'?: number;
  };
  gap?: 'none' | 'sm' | 'md' | 'lg';
}) {
  // Determine gap class
  const gapClass = gap === 'none'
    ? 'gap-0'
    : gap === 'sm'
      ? 'gap-2 sm:gap-3'
      : gap === 'lg'
        ? 'gap-4 sm:gap-6'
        : 'gap-3 sm:gap-4'; // default 'md' gap
  
  // Determine columns classes based on provided configuration
  const colClasses = [
    columns.xs && `grid-cols-${columns.xs}`,
    columns.sm && `sm:grid-cols-${columns.sm}`,
    columns.md && `md:grid-cols-${columns.md}`,
    columns.lg && `lg:grid-cols-${columns.lg}`,
    columns.xl && `xl:grid-cols-${columns.xl}`,
    columns['2xl'] && `2xl:grid-cols-${columns['2xl']}`,
  ].filter(Boolean).join(' ');
  
  return (
    <div className={cn('grid', colClasses, gapClass, className)}>
      {children}
    </div>
  );
}

/**
 * Responsive Flex component that adapts to different screen sizes
 */
export function ResponsiveFlex({
  children,
  className,
  direction = 'row', // 'row', 'col', 'row-reverse', 'col-reverse'
  wrap = true,
  gap = 'md',
  align = 'start', // 'start', 'center', 'end', 'stretch', 'baseline'
  justify = 'start', // 'start', 'center', 'end', 'between', 'around', 'evenly'
  mobileStack = true, // whether to stack items vertically on mobile
}: {
  children: React.ReactNode;
  className?: string;
  direction?: 'row' | 'col' | 'row-reverse' | 'col-reverse';
  wrap?: boolean;
  gap?: 'none' | 'sm' | 'md' | 'lg';
  align?: 'start' | 'center' | 'end' | 'stretch' | 'baseline';
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
  mobileStack?: boolean;
}) {
  // Determine direction class
  const directionClass = mobileStack
    ? `flex-col sm:flex-${direction}`
    : `flex-${direction}`;
  
  // Determine wrap class
  const wrapClass = wrap ? 'flex-wrap' : 'flex-nowrap';
  
  // Determine gap class
  const gapClass = gap === 'none'
    ? 'gap-0'
    : gap === 'sm'
      ? 'gap-2 sm:gap-3'
      : gap === 'lg'
        ? 'gap-4 sm:gap-6'
        : 'gap-3 sm:gap-4'; // default 'md' gap
  
  // Determine alignment classes
  const alignClass = `items-${align}`;
  const justifyClass = `justify-${justify}`;
  
  return (
    <div className={cn('flex', directionClass, wrapClass, gapClass, alignClass, justifyClass, className)}>
      {children}
    </div>
  );
}

/**
 * Responsive spacing component that adds appropriate spacing on different screen sizes
 */
export function ResponsiveSpacing({
  size = 'md',
  orientation = 'vertical',
}: {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  orientation?: 'vertical' | 'horizontal';
}) {
  // Map size to tailwind spacing classes
  const sizeMap = {
    xs: orientation === 'vertical' ? 'h-2 sm:h-3' : 'w-2 sm:w-3',
    sm: orientation === 'vertical' ? 'h-3 sm:h-4' : 'w-3 sm:w-4',
    md: orientation === 'vertical' ? 'h-4 sm:h-6' : 'w-4 sm:w-6',
    lg: orientation === 'vertical' ? 'h-6 sm:h-8' : 'w-6 sm:w-8',
    xl: orientation === 'vertical' ? 'h-8 sm:h-12' : 'w-8 sm:w-12',
  };
  
  return <div className={sizeMap[size]} />;
}

/**
 * Component that shows different content based on screen size
 */
export function ResponsiveShow({
  children,
  breakpoint,
  above = false, // when true, show on sizes above the breakpoint instead of below
}: {
  children: React.ReactNode;
  breakpoint: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  above?: boolean;
}) {
  const classMap = {
    xs: above ? 'hidden' : 'sm:hidden',
    sm: above ? 'hidden xs:block' : 'md:hidden',
    md: above ? 'hidden sm:block' : 'lg:hidden',
    lg: above ? 'hidden md:block' : 'xl:hidden',
    xl: above ? 'hidden lg:block' : '2xl:hidden',
    '2xl': above ? 'hidden xl:block' : '',
  };
  
  return <div className={classMap[breakpoint]}>{children}</div>;
}