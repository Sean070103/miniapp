// Responsive Design Utilities
export const breakpoints = {
  xs: '475px',
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
  '3xl': '1920px',
  '4xl': '2560px',
} as const;

// Responsive spacing utilities
export const responsiveSpacing = {
  xs: {
    padding: 'px-4 py-2',
    margin: 'mx-2 my-1',
    gap: 'gap-2',
  },
  sm: {
    padding: 'px-6 py-3',
    margin: 'mx-4 my-2',
    gap: 'gap-3',
  },
  md: {
    padding: 'px-8 py-4',
    margin: 'mx-6 my-3',
    gap: 'gap-4',
  },
  lg: {
    padding: 'px-12 py-6',
    margin: 'mx-8 my-4',
    gap: 'gap-6',
  },
  xl: {
    padding: 'px-16 py-8',
    margin: 'mx-12 my-6',
    gap: 'gap-8',
  },
} as const;

// Responsive text sizes
export const responsiveText = {
  xs: {
    h1: 'text-2xl',
    h2: 'text-xl',
    h3: 'text-lg',
    body: 'text-sm',
    caption: 'text-xs',
  },
  sm: {
    h1: 'text-3xl',
    h2: 'text-2xl',
    h3: 'text-xl',
    body: 'text-base',
    caption: 'text-sm',
  },
  md: {
    h1: 'text-4xl',
    h2: 'text-3xl',
    h3: 'text-2xl',
    body: 'text-lg',
    caption: 'text-base',
  },
  lg: {
    h1: 'text-5xl',
    h2: 'text-4xl',
    h3: 'text-3xl',
    body: 'text-xl',
    caption: 'text-lg',
  },
  xl: {
    h1: 'text-6xl',
    h2: 'text-5xl',
    h3: 'text-4xl',
    body: 'text-2xl',
    caption: 'text-xl',
  },
} as const;

// Responsive grid layouts
export const responsiveGrid = {
  xs: {
    cols: 'grid-cols-1',
    gap: 'gap-4',
  },
  sm: {
    cols: 'grid-cols-1 sm:grid-cols-2',
    gap: 'gap-4 sm:gap-6',
  },
  md: {
    cols: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3',
    gap: 'gap-4 sm:gap-6 md:gap-8',
  },
  lg: {
    cols: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4',
    gap: 'gap-4 sm:gap-6 md:gap-8 lg:gap-10',
  },
  xl: {
    cols: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5',
    gap: 'gap-4 sm:gap-6 md:gap-8 lg:gap-10 xl:gap-12',
  },
} as const;

// Responsive container classes
export const responsiveContainer = {
  xs: 'max-w-full px-4',
  sm: 'max-w-sm mx-auto px-6',
  md: 'max-w-md mx-auto px-8',
  lg: 'max-w-lg mx-auto px-12',
  xl: 'max-w-xl mx-auto px-16',
  '2xl': 'max-w-2xl mx-auto px-20',
  '3xl': 'max-w-3xl mx-auto px-24',
  '4xl': 'max-w-4xl mx-auto px-28',
  '5xl': 'max-w-5xl mx-auto px-32',
  '6xl': 'max-w-6xl mx-auto px-36',
  '7xl': 'max-w-7xl mx-auto px-40',
} as const;

// Responsive sidebar classes
export const responsiveSidebar = {
  mobile: 'fixed inset-0 z-50 lg:hidden',
  desktop: 'hidden lg:block lg:relative lg:z-auto',
  overlay: 'fixed inset-0 bg-black/50 backdrop-blur-sm lg:hidden',
  content: 'fixed inset-y-0 left-0 z-50 w-72 bg-slate-900/95 backdrop-blur-xl border-r border-slate-700/50 lg:relative lg:translate-x-0',
} as const;

// Responsive navigation classes
export const responsiveNav = {
  mobile: 'flex lg:hidden',
  desktop: 'hidden lg:flex',
  mobileMenu: 'fixed top-0 left-0 w-full bg-slate-900/95 backdrop-blur-xl border-b border-slate-700/50 lg:hidden',
  desktopMenu: 'hidden lg:flex lg:items-center lg:space-x-8',
} as const;

// Responsive card classes
export const responsiveCard = {
  xs: 'p-4 rounded-lg',
  sm: 'p-6 rounded-xl',
  md: 'p-8 rounded-2xl',
  lg: 'p-10 rounded-3xl',
  xl: 'p-12 rounded-3xl',
} as const;

// Responsive button classes
export const responsiveButton = {
  xs: 'px-3 py-2 text-sm',
  sm: 'px-4 py-2 text-base',
  md: 'px-6 py-3 text-lg',
  lg: 'px-8 py-4 text-xl',
  xl: 'px-10 py-5 text-2xl',
} as const;

// Responsive form classes
export const responsiveForm = {
  xs: {
    input: 'px-3 py-2 text-sm',
    label: 'text-sm mb-1',
    group: 'space-y-2',
  },
  sm: {
    input: 'px-4 py-2 text-base',
    label: 'text-base mb-2',
    group: 'space-y-3',
  },
  md: {
    input: 'px-6 py-3 text-lg',
    label: 'text-lg mb-3',
    group: 'space-y-4',
  },
  lg: {
    input: 'px-8 py-4 text-xl',
    label: 'text-xl mb-4',
    group: 'space-y-5',
  },
} as const;

// Utility function to get responsive classes
export function getResponsiveClasses(
  base: string,
  responsive: Record<string, string>
): string {
  return Object.entries(responsive)
    .map(([breakpoint, classes]) => {
      if (breakpoint === 'xs') {
        return classes;
      }
      return `${breakpoint}:${classes}`;
    })
    .join(' ');
}

// Hook for responsive breakpoints (if using React)
export function useResponsive() {
  return {
    breakpoints,
    responsiveSpacing,
    responsiveText,
    responsiveGrid,
    responsiveContainer,
    responsiveSidebar,
    responsiveNav,
    responsiveCard,
    responsiveButton,
    responsiveForm,
    getResponsiveClasses,
  };
}
