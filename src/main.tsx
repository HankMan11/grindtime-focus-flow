
import { createRoot } from 'react-dom/client';
import { Capacitor } from '@capacitor/core';
import App from './App.tsx';
import './index.css';

// Wait for the deviceready event if running on a device
const startApp = () => {
  createRoot(document.getElementById("root")!).render(<App />);
};

if (Capacitor.isNativePlatform()) {
  document.addEventListener('deviceready', startApp, false);
} else {
  startApp();
}
