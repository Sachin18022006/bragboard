import React from 'react';
import ReactDOM from 'react-dom/client';
import axios from 'axios';
import { API_BASE_URL } from './api/config';
import App from './App';
import './assets/global.css';

// Automatically adapt all hardcoded localhost/127.0.0.1 axios calls to cloud API_BASE_URL
axios.interceptors.request.use((config) => {
  if (config.url && config.url.startsWith('http://127.0.0.1:8000')) {
    config.url = config.url.replace('http://127.0.0.1:8000', API_BASE_URL);
  } else if (config.url && config.url.startsWith('http://localhost:8000')) {
    config.url = config.url.replace('http://localhost:8000', API_BASE_URL);
  }
  return config;
});

const rootElement = document.getElementById('root');
const root = ReactDOM.createRoot(rootElement);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);


