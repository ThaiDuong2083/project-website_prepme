import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@styles/globals.css';
import { App } from './app/App';

const root = document.getElementById('root');
if (!root) throw new Error('Root element not found. Check index.html for <div id="root">.');

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
