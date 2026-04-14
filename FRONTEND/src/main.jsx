import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
//import 'leaflet/dist/leaflet.css'; /*recien puesto mapa*/
import 'maplibre-gl/dist/maplibre-gl.css'; /*recien puesto mapa*/


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
