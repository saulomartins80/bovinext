// frontend/pages/_app.tsx
// 
// ROUTING STRUCTURE:
// - PUBLIC PAGES: All marketing, legal, company, blog, community pages (no authentication required)
//   Examples: /, /recursos, /solucoes, /precos, /clientes, /contato, /sobre, /termos, 
//             /blog, /comunidade, /carreiras, /imprensa, /privacidade, /cookies, etc.
// - AUTH PAGES: Login, register, forgot password (no layout, just the form)
// - PROTECTED PAGES: Only dashboard and financial features (require authentication)
//   Examples: /dashboard, /transacoes, /investimentos, /metas, /milhas, /configuracoes, /profile
//
import { useRouter } from 'next/router'
import { ThemeProvider, useTheme } from '../context/ThemeContext'
import { AuthProvider } from '../context/AuthContext'
import { FinanceProvider } from '../context/FinanceContext'
import { DashboardProvider } from '../context/DashboardContext'
import { NotificationProvider } from '../context/NotificationContext'
import type { AppProps } from 'next/app'
import Layout from '../components/Layout'
import '../tailwind-output.css'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import '../styles/globals.css'
import '../styles/splide.css'
import 'react-tabs/style/react-tabs.css'
import { GoogleAnalytics } from '../components/GoogleAnalytics'
import AuthInitializer from '../components/AuthInitializer'
import { Elements } from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import '../i18n';
import { PROTECTED_ROUTES, AUTH_PAGES, isProtectedRoute, isAuthPage } from '../utils/routes';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUB_KEY!);

function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="public-layout min-h-screen flex flex-col">
      <main className="flex-grow">{children}</main>
    </div>
  )
}

function AppContent({ Component, pageProps }: { Component: AppProps['Component']; pageProps: AppProps['pageProps'] }) {
  const router = useRouter()
  
  // Auth pages (login, register, etc.) get no layout
  if (isAuthPage(router.pathname)) {
    return <Component {...pageProps} />;
  }
  
  // Protected routes need authentication and the protected layout
  if (isProtectedRoute(router.pathname)) {
    return (
      <AuthInitializer>
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </AuthInitializer>
    );
  }
  
  // All other routes are public and use the public layout
  // This includes: marketing pages, legal pages, company info, blog, community, etc.
  return (
    <PublicLayout>
      <Component {...pageProps} />
    </PublicLayout>
  );
}

function ProtectedAppContent({ Component, pageProps }: AppProps) {
  return (
    <DashboardProvider>
      <FinanceProvider>
        <NotificationProvider>
          <Elements stripe={stripePromise}>
            <GoogleAnalytics />
            <ToastContainerWithTheme />
            <AppContent Component={Component} pageProps={pageProps} />
          </Elements>
        </NotificationProvider>
      </FinanceProvider>
    </DashboardProvider>
  )
}

function ToastContainerWithTheme() {
  const { theme } = useTheme();
  
  return (
    <ToastContainer
      position="top-right"
      autoClose={5000}
      hideProgressBar={false}
      newestOnTop={true}
      closeOnClick={true}
      rtl={false}
      pauseOnFocusLoss={false}
      draggable={true}
      pauseOnHover={true}
      limit={5}
      style={{ zIndex: 9999 }}
      toastStyle={{ zIndex: 9999 }}
      theme={theme === 'dark' ? 'dark' : 'light'}
      closeButton={true}
      onClick={() => {}}
    />
  );
}

function MyApp(props: AppProps) {
  const router = useRouter()
  
  // Check if current route requires authentication (dashboard and financial features only)
  // All other routes are public (including auth routes, marketing pages, legal pages, etc.)
  const routeNeedsAuth = isProtectedRoute(router.pathname);

  return (
    <ThemeProvider>
      <AuthProvider>
        {!routeNeedsAuth ? (
          <>
            <GoogleAnalytics />
            <ToastContainerWithTheme />
            <AppContent {...props} />
          </>
        ) : (
          <ProtectedAppContent {...props} />
        )}
      </AuthProvider>
    </ThemeProvider>
  )
}

export default MyApp