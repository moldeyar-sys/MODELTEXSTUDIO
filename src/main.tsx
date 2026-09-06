import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

// El middleware (middleware.ts) agrega a los robots un bloque de contenido
// estatico debajo de #root. Si ese HTML llega a un navegador real (o Google
// renderiza la pagina con JavaScript), se saca antes de montar la app para no
// duplicar titulos ni texto.
document.querySelectorAll('[data-bot-content]').forEach((el) => el.remove());

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
