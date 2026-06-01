/// <reference types="vite/client" />

declare module '*.html?raw' {
  const content: string;
  export default content;
}

interface ImportMetaEnv {
  readonly REACT_APP_FACEBOOK_PIXEL_ID: string;
  readonly VITE_FACEBOOK_PIXEL_ID?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare global {
  interface Window {
    fbq?: FbqFunction;
    _fbq?: FbqFunction;
  }
}

type FbqFunction = {
  (...args: unknown[]): void;
  callMethod?: (...args: unknown[]) => void;
  queue: unknown[][];
  push: FbqFunction;
  loaded: boolean;
  version: string;
};

export {};
