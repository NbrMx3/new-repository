// This file exists to prevent 404 errors from a stale Workbox service worker
// that cached an old index.html referencing main.tsx instead of main.jsx.
// It simply re-exports the actual entry point.
export * from './main.jsx';
