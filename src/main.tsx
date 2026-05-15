import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { FitnessProvider } from './contexts/FitnessContext';
import { ThemeProvider } from './contexts/ThemeContext';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <FitnessProvider>
        <App />
      </FitnessProvider>
    </ThemeProvider>
  </StrictMode>,
);
