import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import './index.css';
import MapPage from './pages/MapPage';
import AdminPage from './pages/AdminPage';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MapPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="*" element={<MapPage />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
);
