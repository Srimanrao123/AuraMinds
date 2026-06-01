import { useEffect, useRef, type ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { initMetaPixel, trackPageView } from '../utils/metaPixel';

type MetaPixelProviderProps = {
  children: ReactNode;
};

/**
 * Initializes Meta Pixel once and fires PageView on mount and route changes.
 */
export function MetaPixelProvider({ children }: MetaPixelProviderProps) {
  const location = useLocation();
  const isFirstNavigation = useRef(true);

  useEffect(() => {
    initMetaPixel();
    trackPageView();
  }, []);

  useEffect(() => {
    if (isFirstNavigation.current) {
      isFirstNavigation.current = false;
      return;
    }
    trackPageView();
  }, [location.pathname, location.search, location.hash]);

  return <>{children}</>;
}
