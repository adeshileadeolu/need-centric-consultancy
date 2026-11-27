import React from 'react';

// Catches any rendering error anywhere in the app and shows a recoverable message
// instead of leaving the page blank or frozen. This doesn't fix an underlying bug,
// but it turns a silent crash into something the visitor can see and act on.
export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error, info) {
    // eslint-disable-next-line no-console
    console.error('Need-Centric site error:', error, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh', display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', textAlign: 'center',
          padding: '2rem', fontFamily: 'system-ui, sans-serif', background: '#faf7f2', color: '#0b1b33'
        }}>
          <h1 style={{ fontSize: '1.4rem', marginBottom: '.75rem' }}>Something went wrong loading this page.</h1>
          <p style={{ color: '#5d6677', marginBottom: '1.5rem', maxWidth: 420 }}>
            Please try reloading. If this keeps happening, email us at{' '}
            <a href="mailto:needcentricconsultancy@gmail.com" style={{ color: '#0b1b33' }}>
              needcentricconsultancy@gmail.com
            </a>.
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              background: '#0b1b33', color: '#fff', border: 0, padding: '.75rem 1.5rem',
              borderRadius: 4, fontWeight: 600, cursor: 'pointer'
            }}
          >
            Reload page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
