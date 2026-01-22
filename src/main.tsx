import { createRoot } from 'react-dom/client'
import App from './App.tsx'

// Import Leaflet CSS globally to prevent issues with component mount/unmount
import 'leaflet/dist/leaflet.css'

// Note: Removed StrictMode as it causes issues with Leaflet's global state
// Leaflet doesn't handle double mount/unmount well in React 18 StrictMode
createRoot(document.getElementById('root')!).render(<App />)
