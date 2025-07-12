/**
 * Responsive Utilities für H5P-Viewer
 * Hilfsfunktionen für responsive Design und Geräte-Detection
 */

export interface BreakpointConfig {
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  '2xl': number;
  '3xl': number;
  '4xl': number;
}

export const breakpoints: BreakpointConfig = {
  xs: 380,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
  '3xl': 1920,
  '4xl': 2560,
};

export type DeviceType = 'mobile' | 'tablet' | 'desktop' | 'widescreen' | 'ultrawide';

/**
 * Ermittelt den Gerätetyp basierend auf der Bildschirmbreite
 */
export function getDeviceType(width: number): DeviceType {
  if (width < breakpoints.md) return 'mobile';
  if (width < breakpoints.lg) return 'tablet';
  if (width < breakpoints['3xl']) return 'desktop';
  if (width < breakpoints['4xl']) return 'widescreen';
  return 'ultrawide';
}

/**
 * Hook für responsive Design - kann in React-Komponenten verwendet werden
 */
export function useResponsive() {
  if (typeof window === 'undefined') {
    return {
      width: 1024,
      height: 768,
      deviceType: 'desktop' as DeviceType,
      isMobile: false,
      isTablet: false,
      isDesktop: true,
      isWidescreen: false,
      isUltrawide: false,
    };
  }

  const width = window.innerWidth;
  const height = window.innerHeight;
  const deviceType = getDeviceType(width);

  return {
    width,
    height,
    deviceType,
    isMobile: deviceType === 'mobile',
    isTablet: deviceType === 'tablet',
    isDesktop: deviceType === 'desktop',
    isWidescreen: deviceType === 'widescreen',
    isUltrawide: deviceType === 'ultrawide',
  };
}

/**
 * Responsive Schriftgrößen-Konfiguration
 */
export const responsiveFontSizes = {
  xs: {
    mobile: '0.75rem',
    tablet: '0.8125rem',
    desktop: '0.875rem',
    widescreen: '0.9375rem',
    ultrawide: '1rem',
  },
  sm: {
    mobile: '0.875rem',
    tablet: '0.9375rem',
    desktop: '1rem',
    widescreen: '1.0625rem',
    ultrawide: '1.125rem',
  },
  base: {
    mobile: '1rem',
    tablet: '1.0625rem',
    desktop: '1.125rem',
    widescreen: '1.1875rem',
    ultrawide: '1.25rem',
  },
  lg: {
    mobile: '1.125rem',
    tablet: '1.1875rem',
    desktop: '1.25rem',
    widescreen: '1.3125rem',
    ultrawide: '1.375rem',
  },
  xl: {
    mobile: '1.25rem',
    tablet: '1.3125rem',
    desktop: '1.375rem',
    widescreen: '1.4375rem',
    ultrawide: '1.5rem',
  },
  '2xl': {
    mobile: '1.5rem',
    tablet: '1.625rem',
    desktop: '1.75rem',
    widescreen: '1.875rem',
    ultrawide: '2rem',
  },
  '3xl': {
    mobile: '1.875rem',
    tablet: '2rem',
    desktop: '2.25rem',
    widescreen: '2.5rem',
    ultrawide: '2.75rem',
  },
  '4xl': {
    mobile: '2.25rem',
    tablet: '2.5rem',
    desktop: '2.875rem',
    widescreen: '3.25rem',
    ultrawide: '3.75rem',
  },
};

/**
 * Responsive Abstände-Konfiguration
 */
export const responsiveSpacing = {
  xs: {
    mobile: '0.25rem',
    tablet: '0.3125rem',
    desktop: '0.375rem',
    widescreen: '0.4375rem',
    ultrawide: '0.5rem',
  },
  sm: {
    mobile: '0.5rem',
    tablet: '0.625rem',
    desktop: '0.75rem',
    widescreen: '0.875rem',
    ultrawide: '1rem',
  },
  md: {
    mobile: '1rem',
    tablet: '1.25rem',
    desktop: '1.5rem',
    widescreen: '1.75rem',
    ultrawide: '2rem',
  },
  lg: {
    mobile: '1.5rem',
    tablet: '1.875rem',
    desktop: '2.25rem',
    widescreen: '2.625rem',
    ultrawide: '3rem',
  },
  xl: {
    mobile: '2rem',
    tablet: '2.5rem',
    desktop: '3rem',
    widescreen: '3.5rem',
    ultrawide: '4rem',
  },
  '2xl': {
    mobile: '3rem',
    tablet: '3.75rem',
    desktop: '4.5rem',
    widescreen: '5.25rem',
    ultrawide: '6rem',
  },
};

/**
 * Container-Größen für verschiedene Geräte
 */
export const responsiveContainerSizes = {
  mobile: '100%',
  tablet: '100%',
  desktop: '1200px',
  widescreen: '1400px',
  ultrawide: '1600px',
};

/**
 * Grid-Konfigurationen für verschiedene Inhaltstypen
 */
export const responsiveGridConfigs = {
  cards: {
    mobile: 'repeat(1, 1fr)',
    tablet: 'repeat(2, 1fr)',
    desktop: 'repeat(auto-fit, minmax(350px, 1fr))',
    widescreen: 'repeat(auto-fit, minmax(400px, 1fr))',
    ultrawide: 'repeat(auto-fit, minmax(450px, 1fr))',
  },
  content: {
    mobile: 'repeat(1, 1fr)',
    tablet: 'repeat(1, 1fr)',
    desktop: 'repeat(2, 1fr)',
    widescreen: 'repeat(3, 1fr)',
    ultrawide: 'repeat(4, 1fr)',
  },
  gallery: {
    mobile: 'repeat(2, 1fr)',
    tablet: 'repeat(3, 1fr)',
    desktop: 'repeat(4, 1fr)',
    widescreen: 'repeat(5, 1fr)',
    ultrawide: 'repeat(6, 1fr)',
  },
};

/**
 * Hilfsfunktion zur Generierung von responsive CSS-Klassen
 */
export function generateResponsiveClasses(
  baseClass: string,
  sizes: Partial<Record<DeviceType, string>>
): string {
  const classes = [baseClass];

  if (sizes.mobile) classes.push(`mobile:${sizes.mobile}`);
  if (sizes.tablet) classes.push(`tablet:${sizes.tablet}`);
  if (sizes.desktop) classes.push(`desktop:${sizes.desktop}`);
  if (sizes.widescreen) classes.push(`widescreen:${sizes.widescreen}`);
  if (sizes.ultrawide) classes.push(`ultrawide:${sizes.ultrawide}`);

  return classes.join(' ');
}

/**
 * Performance-optimierte Medienabfragen
 */
export const mediaQueries = {
  mobile: `(max-width: ${breakpoints.md - 1}px)`,
  tablet: `(min-width: ${breakpoints.md}px) and (max-width: ${breakpoints.lg - 1}px)`,
  desktop: `(min-width: ${breakpoints.lg}px)`,
  widescreen: `(min-width: ${breakpoints['3xl']}px)`,
  ultrawide: `(min-width: ${breakpoints['4xl']}px)`,
  
  // Touch und Hover Support
  touchDevice: '(hover: none) and (pointer: coarse)',
  hoverDevice: '(hover: hover) and (pointer: fine)',
  
  // Orientierung
  landscape: '(orientation: landscape)',
  portrait: '(orientation: portrait)',
  
  // Hohe DPI-Displays
  highDpi: '(-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi)',
  
  // Bevorzugte Farbschemas
  darkMode: '(prefers-color-scheme: dark)',
  lightMode: '(prefers-color-scheme: light)',
  
  // Bewegungseinstellungen
  reducedMotion: '(prefers-reduced-motion: reduce)',
  
  // Kontrast-Einstellungen
  highContrast: '(prefers-contrast: high)',
};

/**
 * Utility für das Generieren von CSS Custom Properties
 */
export function generateCSSCustomProperties() {
  return `
    :root {
      /* Responsive Breakpoints */
      --bp-xs: ${breakpoints.xs}px;
      --bp-sm: ${breakpoints.sm}px;
      --bp-md: ${breakpoints.md}px;
      --bp-lg: ${breakpoints.lg}px;
      --bp-xl: ${breakpoints.xl}px;
      --bp-2xl: ${breakpoints['2xl']}px;
      --bp-3xl: ${breakpoints['3xl']}px;
      --bp-4xl: ${breakpoints['4xl']}px;
      
      /* Container Sizes */
      --container-mobile: ${responsiveContainerSizes.mobile};
      --container-tablet: ${responsiveContainerSizes.tablet};
      --container-desktop: ${responsiveContainerSizes.desktop};
      --container-widescreen: ${responsiveContainerSizes.widescreen};
      --container-ultrawide: ${responsiveContainerSizes.ultrawide};
    }
  `;
}

export default {
  breakpoints,
  getDeviceType,
  useResponsive,
  responsiveFontSizes,
  responsiveSpacing,
  responsiveContainerSizes,
  responsiveGridConfigs,
  generateResponsiveClasses,
  mediaQueries,
  generateCSSCustomProperties,
};
