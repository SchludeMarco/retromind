import React from 'react';
import ReactDOM from 'react-dom/client';
import { GamingApp } from './GamingApp';
import './gaming.css';

const root = document.getElementById('root');
if (!root) throw new Error('Could not find root element to mount to');

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <GamingApp />
  </React.StrictMode>
);
