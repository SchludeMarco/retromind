import React from 'react';
import ReactDOM from 'react-dom/client';
import { AdminApp } from './AdminApp';
import '@fontsource/playfair-display/latin-700.css';
import '@fontsource/space-mono/latin-400.css';
import '@fontsource/space-mono/latin-700.css';
import './admin.css';

const root = document.getElementById('root');
if (!root) throw new Error('Could not find root element to mount to');

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <AdminApp />
  </React.StrictMode>
);
