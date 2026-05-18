import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ToastProvider } from './components/Toast.jsx'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <BrowserRouter>
            <ToastProvider>
                <App />
            </ToastProvider>
        </BrowserRouter>
    </StrictMode>
)

// Register PWA Service Worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(reg => {
                console.log('[PWA] Service Worker registered successfully', reg.scope);
                
                // Ensure dynamic Vite assets (like /assets/index-XXXX.js) are cached by the SW
                const cacheActiveAssets = () => {
                    const scripts = Array.from(document.querySelectorAll('script[src]')).map(s => s.src);
                    const links = Array.from(document.querySelectorAll('link[rel="stylesheet"]')).map(l => l.href);
                    const assets = [...scripts, ...links].filter(url => url.startsWith(window.location.origin));
                    
                    // Fetching them again forces the active Service Worker to intercept and cache them
                    assets.forEach(url => fetch(url).catch(() => {}));
                };

                if (navigator.serviceWorker.controller) {
                    cacheActiveAssets();
                } else {
                    navigator.serviceWorker.addEventListener('controllerchange', () => {
                        cacheActiveAssets();
                    });
                }
            })
            .catch(err => console.error('[PWA] Service Worker registration failed', err));
    });
}