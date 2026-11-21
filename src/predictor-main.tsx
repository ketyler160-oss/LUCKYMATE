import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ErrorBoundary } from './components/ErrorBoundary';
import { PredictorView } from './components/PredictorView';
import { CrashGameId } from './types';
import './index.css';

function getInitialGameFromQuery(): CrashGameId {
  try {
    const params = new URLSearchParams(window.location.search);
    const raw = (params.get('game') || '').trim().toLowerCase();
    if (raw) {
      return raw as CrashGameId;
    }
  } catch {
    // Default to aviator
  }
  return 'aviator';
}

createRoot(document.getElementById('predictor-root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <PredictorView standalone initialGameId={getInitialGameFromQuery()} />
    </ErrorBoundary>
  </StrictMode>
);
