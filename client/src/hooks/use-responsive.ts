import { useState, useEffect } from 'react';

// Breakpoint sizes in pixels
export const breakpoints = {
  xs: 0,     // Extra small devices (phones)
  sm: 640,   // Small devices (large phones, small tablets)
  md: 768,   // Medium devices (tablets)
  lg: 1024,  // Large devices (desktops)
  xl: 1280,  // Extra large devices (large desktops)
  '2xl': 1536 // 2XL devices (very large desktops)
};

type Breakpoint = keyof typeof breakpoints;

/**
 * Hook for responsive design
 * Returns the current breakpoint and boolean flags for each breakpoint
 */
export function useResponsive() {
  // Initialize with default values
  const [currentBreakpoint, setCurrentBreakpoint] = useState<Breakpoint>('md');
  
  // Boolean indicators for each breakpoint
  const [isXs, setIsXs] = useState(false);
  const [isSm, setIsSm] = useState(false);
  const [isMd, setIsMd] = useState(false);
  const [isLg, setIsLg] = useState(false);
  const [isXl, setIsXl] = useState(false);
  const [is2Xl, setIs2Xl] = useState(false);
  
  // Flag for mobile devices (xs and sm breakpoints)
  const [isMobile, setIsMobile] = useState(false);
  
  // Flag for tablet devices (md breakpoint)
  const [isTablet, setIsTablet] = useState(false);
  
  // Flag for desktop devices (lg, xl, and 2xl breakpoints)
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    // Function to update breakpoint based on window width
    const updateBreakpoint = () => {
      const width = window.innerWidth;
      
      // Determine current breakpoint
      let newBreakpoint: Breakpoint = 'xs';
      
      if (width >= breakpoints['2xl']) {
        newBreakpoint = '2xl';
      } else if (width >= breakpoints.xl) {
        newBreakpoint = 'xl';
      } else if (width >= breakpoints.lg) {
        newBreakpoint = 'lg';
      } else if (width >= breakpoints.md) {
        newBreakpoint = 'md';
      } else if (width >= breakpoints.sm) {
        newBreakpoint = 'sm';
      }
      
      // Update the current breakpoint
      setCurrentBreakpoint(newBreakpoint);
      
      // Update individual breakpoint flags
      setIsXs(width < breakpoints.sm);
      setIsSm(width >= breakpoints.sm && width < breakpoints.md);
      setIsMd(width >= breakpoints.md && width < breakpoints.lg);
      setIsLg(width >= breakpoints.lg && width < breakpoints.xl);
      setIsXl(width >= breakpoints.xl && width < breakpoints['2xl']);
      setIs2Xl(width >= breakpoints['2xl']);
      
      // Update device category flags
      setIsMobile(width < breakpoints.md);
      setIsTablet(width >= breakpoints.md && width < breakpoints.lg);
      setIsDesktop(width >= breakpoints.lg);
    };
    
    // Set the initial breakpoint
    updateBreakpoint();
    
    // Add event listener for window resize
    window.addEventListener('resize', updateBreakpoint);
    
    // Clean up the event listener on component unmount
    return () => {
      window.removeEventListener('resize', updateBreakpoint);
    };
  }, []);

  return {
    // Current breakpoint name
    breakpoint: currentBreakpoint,
    
    // Individual breakpoint flags
    isXs,
    isSm,
    isMd,
    isLg,
    isXl,
    is2Xl,
    
    // Device category flags
    isMobile,
    isTablet,
    isDesktop,
    
    // Helper function for media queries
    up: (breakpoint: Breakpoint) => window.innerWidth >= breakpoints[breakpoint],
    down: (breakpoint: Breakpoint) => window.innerWidth < breakpoints[breakpoint],
    between: (start: Breakpoint, end: Breakpoint) => 
      window.innerWidth >= breakpoints[start] && window.innerWidth < breakpoints[end],
  };
}

// Removed the HOC for simplicity to avoid TypeScript errors

// Export a simple hook for checking if the current view is mobile
export function useIsMobile() {
  const { isMobile } = useResponsive();
  return isMobile;
}

// Export a hook for returning appropriate values based on current breakpoint
export function useBreakpointValue<T>(values: { [key in Breakpoint]?: T }, defaultValue?: T): T | undefined {
  const { breakpoint } = useResponsive();
  
  // Try to get the value for the current breakpoint
  if (values[breakpoint] !== undefined) {
    return values[breakpoint];
  }
  
  // If no exact match, try to find the closest smaller breakpoint
  const breakpointOrder: Breakpoint[] = ['xs', 'sm', 'md', 'lg', 'xl', '2xl'];
  const currentIndex = breakpointOrder.indexOf(breakpoint);
  
  // Search for the closest smaller breakpoint with a defined value
  for (let i = currentIndex - 1; i >= 0; i--) {
    const bp = breakpointOrder[i];
    if (values[bp] !== undefined) {
      return values[bp];
    }
  }
  
  // Return the default value if provided
  return defaultValue;
}