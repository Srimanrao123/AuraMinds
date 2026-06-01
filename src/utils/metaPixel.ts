/**
 * Meta (Facebook) Pixel — single init, typed event helpers.
 * @see https://developers.facebook.com/docs/meta-pixel/get-started
 */

type FbqFunction = {
  (...args: unknown[]): void;
  callMethod?: (...args: unknown[]) => void;
  queue: unknown[][];
  push: FbqFunction;
  loaded: boolean;
  version: string;
};

export type MetaPixelEventParams = Record<string, string | number | boolean | undefined>;

let isInitialized = false;

function getPixelId(): string | undefined {
  const id = import.meta.env.REACT_APP_FACEBOOK_PIXEL_ID?.trim();
  if (id) return id;
  return import.meta.env.VITE_FACEBOOK_PIXEL_ID?.trim();
}

function getFbq(): FbqFunction | undefined {
  if (typeof window === 'undefined') return undefined;
  return window.fbq;
}

function isFbqReady(): boolean {
  return typeof getFbq() === 'function';
}

/**
 * Loads the Meta Pixel base script and calls fbq('init', pixelId) once.
 * Safe to call multiple times — subsequent calls are no-ops.
 */
export function initMetaPixel(): boolean {
  if (typeof window === 'undefined') return false;
  if (isInitialized && isFbqReady()) return true;

  const pixelId = getPixelId();
  if (!pixelId) {
    if (import.meta.env.DEV) {
      console.warn(
        '[Meta Pixel] REACT_APP_FACEBOOK_PIXEL_ID is not set. Tracking is disabled.',
      );
    }
    return false;
  }

  if (isFbqReady()) {
    isInitialized = true;
    return true;
  }

  const injectScript = (): void => {
    if (document.getElementById('facebook-pixel-script')) return;

    const script = document.createElement('script');
    script.id = 'facebook-pixel-script';
    script.async = true;
    script.src = 'https://connect.facebook.net/en_US/fbevents.js';
    const firstScript = document.getElementsByTagName('script')[0];
    firstScript?.parentNode?.insertBefore(script, firstScript);
  };

  if (!window.fbq) {
    const queue: unknown[][] = [];
    const fbq = function fbqCommand(...args: unknown[]) {
      if (fbq.callMethod) {
        fbq.callMethod(...args);
      } else {
        queue.push(args);
      }
    } as FbqFunction;

    fbq.push = fbq;
    fbq.loaded = true;
    fbq.version = '2.0';
    fbq.queue = queue;
    window.fbq = fbq;
    window._fbq = fbq;
    injectScript();
  }

  window.fbq!('init', pixelId);
  isInitialized = true;
  return true;
}

function track(eventName: string, params?: MetaPixelEventParams): void {
  if (!initMetaPixel()) return;
  const fbq = getFbq();
  if (!fbq) return;

  if (params && Object.keys(params).length > 0) {
    fbq('track', eventName, params);
  } else {
    fbq('track', eventName);
  }
}

/** Standard PageView — call on load and on React Router navigation. */
export function trackPageView(): void {
  track('PageView');
}

/** User submitted a demo / contact lead form. */
export function trackLead(params?: MetaPixelEventParams): void {
  track('Lead', params);
}

/** User clicked a WhatsApp contact link. */
export function trackContact(params?: MetaPixelEventParams): void {
  track('Contact', params);
}

/** User booked a demo session (confirmed booking). */
export function trackSchedule(params?: MetaPixelEventParams): void {
  track('Schedule', params);
}
