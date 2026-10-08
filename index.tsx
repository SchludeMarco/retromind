import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
// Fonts are bundled with the app (no request to Google Fonts, DSGVO).
import '@fontsource/playfair-display/latin-400.css';
import '@fontsource/playfair-display/latin-700.css';
import '@fontsource/playfair-display/latin-400-italic.css';
import '@fontsource/space-mono/latin-400.css';
import '@fontsource/space-mono/latin-700.css';
import '@fontsource/cinzel-decorative/latin-400.css';
import '@fontsource/cinzel-decorative/latin-700.css';
import '@fontsource/cinzel-decorative/latin-900.css';
import '@fontsource/cormorant-garamond/latin-500-italic.css';
import '@fontsource/cormorant-garamond/latin-600-italic.css';
// Fonts of the "Retro Warm" design (only downloaded while it is active).
import '@fontsource/epilogue/latin-600.css';
import '@fontsource/epilogue/latin-700.css';
import '@fontsource/plus-jakarta-sans/latin-400.css';
import '@fontsource/plus-jakarta-sans/latin-500.css';
import '@fontsource/plus-jakarta-sans/latin-600.css';
import '@fontsource/plus-jakarta-sans/latin-700.css';
import './index.css';
// Applies the saved design before the first render, so it doesn't flash.
import './lib/theme';
import { countAppStart } from './lib/usage';

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { error: Error | null }
> {
  state: { error: Error | null } = { error: null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('RetroMind ist abgestürzt:', error, info);
  }

  render() {
    if (this.state.error) {
      return (
        <div
          style={{
            maxWidth: 520,
            margin: '15vh auto',
            padding: 32,
            border: '3px solid #2c1810',
            background: '#fff9eb',
            color: '#2c1810',
            fontFamily: "'Space Mono', monospace",
            textAlign: 'center',
          }}
        >
          <h1 style={{ fontFamily: "'Playfair Display', serif" }}>Ups – da ist etwas schiefgelaufen.</h1>
          <p>
            Dein Tagebuch und deine Erinnerungen sind in diesem Browser gespeichert und bleiben erhalten.
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              marginTop: 16,
              padding: '12px 28px',
              fontWeight: 700,
              border: '2px solid #2c1810',
              background: '#d97706',
              color: '#fff',
              cursor: 'pointer',
            }}
          >
            Neu laden
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Could not find root element to mount to');
}

countAppStart('zeitreise');

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
