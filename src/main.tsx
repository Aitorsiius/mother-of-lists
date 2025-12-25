/*
 * Mother Of Lists
 * Copyright (C) 2025 Aitor Gómez Ogueta
 * * Este programa es software libre: puedes redistribuirlo y/o modificarlo 
 * bajo los términos de la Licencia Pública General de GNU según es 
 * publicada por la Free Software Foundation, bien de la versión 3 de 
 * la Licencia, o (a tu elección) cualquier versión posterior.
 */

  import { createRoot } from "react-dom/client";
  import App from "./app/App.tsx";
  import "./styles/index.css";

  createRoot(document.getElementById("root")!).render(<App />);
  