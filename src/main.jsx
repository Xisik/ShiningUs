import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';

import '../assets/css/tokens.css';
import '../assets/css/tokens-dark.css';
import '../assets/css/base.css';
import '../assets/css/layout.css';
import '../assets/css/components.css';
import '../assets/css/animations.css';
import '../assets/css/thumbnail-slide.css';
import '../assets/css/react-app.css';

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
