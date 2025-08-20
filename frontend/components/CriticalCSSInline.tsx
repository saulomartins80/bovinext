import { useEffect } from 'react'

// Critical CSS for above-the-fold content - inlined for fastest LCP
const criticalCSS = `
/* Reset and base styles */
* { box-sizing: border-box; }
body { 
  margin: 0; 
  padding: 0; 
  font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* Hero section critical styles */
.hero-section {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.hero-content {
  text-align: center;
  color: white;
  max-width: 800px;
}

.hero-title {
  font-size: clamp(2rem, 5vw, 4rem);
  font-weight: 700;
  margin-bottom: 1rem;
  line-height: 1.2;
}

.hero-subtitle {
  font-size: clamp(1rem, 2.5vw, 1.5rem);
  opacity: 0.9;
  margin-bottom: 2rem;
  line-height: 1.4;
}

/* Button styles */
.btn-primary {
  background: rgba(255, 255, 255, 0.2);
  border: 2px solid rgba(255, 255, 255, 0.3);
  color: white;
  padding: 0.75rem 2rem;
  border-radius: 0.5rem;
  font-weight: 600;
  text-decoration: none;
  display: inline-block;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}

.btn-primary:hover {
  background: rgba(255, 255, 255, 0.3);
  border-color: rgba(255, 255, 255, 0.5);
  transform: translateY(-2px);
}

/* Loading states */
.loading-skeleton {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
}

@keyframes loading {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

.spinner {
  border: 2px solid #f3f3f3;
  border-top: 2px solid #3498db;
  border-radius: 50%;
  width: 2rem;
  height: 2rem;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Critical layout utilities */
.flex { display: flex; }
.items-center { align-items: center; }
.justify-center { justify-content: center; }
.text-center { text-align: center; }
.min-h-screen { min-height: 100vh; }
.fixed { position: fixed; }
.inset-0 { top: 0; right: 0; bottom: 0; left: 0; }
.z-50 { z-index: 50; }
.bg-white { background-color: white; }
.text-white { color: white; }
.mb-4 { margin-bottom: 1rem; }
.mb-6 { margin-bottom: 1.5rem; }
.p-4 { padding: 1rem; }
.rounded { border-radius: 0.25rem; }
.shadow { box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1); }

/* Responsive utilities */
@media (max-width: 640px) {
  .hero-section { padding: 0.5rem; }
  .hero-title { font-size: 2rem; }
  .hero-subtitle { font-size: 1rem; }
  .btn-primary { padding: 0.5rem 1.5rem; font-size: 0.9rem; }
}

/* Skip link for accessibility */
.skip-link {
  position: absolute;
  left: -10000px;
  top: auto;
  width: 1px;
  height: 1px;
  overflow: hidden;
}

.skip-link:focus {
  position: fixed;
  top: 0;
  left: 0;
  width: auto;
  height: auto;
  padding: 0.5rem 1rem;
  background: #000;
  color: #fff;
  z-index: 9999;
  text-decoration: none;
}
`

export default function CriticalCSSInline() {
  useEffect(() => {
    // Inject critical CSS immediately
    const style = document.createElement('style')
    style.textContent = criticalCSS
    style.setAttribute('data-critical', 'true')
    document.head.insertBefore(style, document.head.firstChild)

    return () => {
      // Cleanup on unmount
      const criticalStyle = document.querySelector('[data-critical="true"]')
      if (criticalStyle) {
        criticalStyle.remove()
      }
    }
  }, [])

  return null
}

// Export the CSS string for SSR
export { criticalCSS }
