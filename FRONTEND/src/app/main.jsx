import React from 'react';
import ReactDOM from 'react-dom/client';
import App from '@/app/App.jsx';
import '@/styles/index.css';
import 'maplibre-gl/dist/maplibre-gl.css';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("No se pudo encontrar el elemento raíz para montar la aplicación.");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

