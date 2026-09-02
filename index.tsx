import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

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

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
