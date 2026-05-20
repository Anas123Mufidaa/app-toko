import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { registerSW } from 'virtual:pwa-register';
import './index.css';
import App from './App.jsx';

if (import.meta.env.DEV && 'serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    registrations.forEach((registration) => {
      registration.unregister();
    });
  });
}

if (import.meta.env.PROD) {
  registerSW({
    onNeedRefresh() {
      console.info('Versi baru tersedia. Reload untuk update.');
    },
    onOfflineReady() {
      console.info('Aplikasi siap digunakan secara offline.');
    },
  });
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
