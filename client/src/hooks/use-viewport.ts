import { useState, useEffect } from 'react';

// Define screen size breakpoints
export const breakpoints = {
  xs: 0,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
};

export type Breakpoint = keyof typeof breakpoints;

// Define screen size ranges
export type ScreenSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

interface ViewportDimensions {
  width: number;
  height: number;
  screenSize: ScreenSize;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
}

/**
 * Custom hook to get viewport dimensions and screen size category
 */
export function useViewport(): ViewportDimensions {
  // Default to reasonable values for server-side rendering
  const [dimensions, setDimensions] = useState<ViewportDimensions>({
    width: typeof window !== 'undefined' ? window.innerWidth : 1024,
    height: typeof window !== 'undefined' ? window.innerHeight : 768,
    screenSize: 'lg',
    isMobile: false,
    isTablet: false,
    isDesktop: true,
  });

  useEffect(() => {
    const getScreenSize = (width: number): ScreenSize => {
      if (width < breakpoints.sm) return 'xs';
      if (width < breakpoints.md) return 'sm';
      if (width < breakpoints.lg) return 'md';
      if (width < breakpoints.xl) return 'lg';
      if (width < breakpoints['2xl']) return 'xl';
      return '2xl';
    };

    // Handler to call on window resize
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const screenSize = getScreenSize(width);
      
      // Set device type flags
      const isMobile = width < breakpoints.md;
      const isTablet = width >= breakpoints.md && width < breakpoints.lg;
      const isDesktop = width >= breakpoints.lg;

      setDimensions({
        width,
        height,
        screenSize,
        isMobile,
        isTablet,
        isDesktop,
      });
    };

    // Add event listener
    window.addEventListener('resize', handleResize);
    
    // Call handler right away so state gets updated with initial window size
    handleResize();
    
    // Remove event listener on cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, []); // Empty array ensures effect runs only on mount and unmount

  return dimensions;
}

/**
 * Hook to get a boolean indicating if the current screen size matches the provided breakpoint or is larger
 * @param breakpoint The minimum breakpoint to check for
 */
export function useBreakpoint(breakpoint: Breakpoint): boolean {
  const { width } = useViewport();
  return width >= breakpoints[breakpoint];
}

/**
 * Hook specifically for checking if the device is mobile
 */
export function useMobile(): boolean {
  const { isMobile } = useViewport();
  return isMobile;
}

/**
 * Hook for checking if the device is a tablet
 */
export function useTablet(): boolean {
  const { isTablet } = useViewport();
  return isTablet;
}

/**
 * Hook for checking if the device is a desktop
 */
export function useDesktop(): boolean {
  const { isDesktop } = useViewport();
  return isDesktop;
}