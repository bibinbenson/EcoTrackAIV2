import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Set the document title
document.title = "EcoTrack - ESG & Carbon Footprint Tracker";

// Add favicon dynamically
const link = document.createElement('link');
link.rel = 'icon';
link.href = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%232E7D32"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 16.95h-2v-9h2v9zm4 0h-2v-12h2v12z"/></svg>';
document.head.appendChild(link);

createRoot(document.getElementById("root")!).render(<App />);
