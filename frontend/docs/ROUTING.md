# Routing Structure

This document describes the routing structure of the application, which has been updated to make most pages publicly accessible while keeping only the dashboard and financial features protected.

## Route Categories

### 🌐 Public Pages (No Authentication Required)
These pages are accessible to everyone without requiring login:

- **Marketing Pages**: `/`, `/recursos`, `/solucoes`, `/precos`, `/clientes`, `/contato`
- **Company Info**: `/sobre`, `/empresa`, `/carreiras`, `/imprensa`, `/parceiros`
- **Legal Pages**: `/termos`, `/privacidade`, `/cookies`, `/seguranca`, `/juridico`, `/licencas`
- **Community**: `/blog`, `/comunidade`, `/suporte`, `/demo`, `/ebook`
- **Utilities**: `/connect`, `/test-toast`

All public pages use the `PublicLayout` component which provides a minimal layout suitable for marketing and informational content.

### 🔐 Protected Pages (Authentication Required)
These pages require user authentication and contain financial features:

- **Dashboard**: `/dashboard` - Main user dashboard
- **Financial Features**:
  - `/transacoes` - Transaction management
  - `/investimentos` - Investment tracking
  - `/metas` - Financial goals
  - `/milhas` - Miles/rewards tracking
  - `/relatorios` - Financial reports
- **User Management**:
  - `/configuracoes` - User settings
  - `/profile` - User profile
  - `/assinaturas` - Subscription management
- **System**: `/sistema`, `/payment`, `/payment/sucesso`

Protected pages use the `Layout` component wrapped in `AuthInitializer` for authentication checks.

### 🔑 Authentication Pages (Minimal Layout)
These pages handle user authentication and use minimal or no layout:

- `/auth/login` - User login
- `/auth/register` - User registration  
- `/auth/forgot-password` - Password recovery
- `/auth/complete-registration` - Complete registration process

## Configuration

Route configuration is centralized in `/utils/routes.ts`:

```typescript
import { isProtectedRoute, isAuthPage, isPublicRoute } from '../utils/routes';
```

### Key Functions:
- `isProtectedRoute(pathname)` - Check if route requires authentication
- `isAuthPage(pathname)` - Check if route is an auth page
- `isPublicRoute(pathname)` - Check if route is public

## Layout Structure

```
MyApp
├── ThemeProvider
├── AuthProvider
└── Conditional Rendering:
    ├── Public/Auth Routes → AppContent → PublicLayout or AuthPage
    └── Protected Routes → ProtectedAppContent → AuthInitializer → Layout
```

## Adding New Routes

### Adding a Public Route
Public routes are automatically handled - any route not in `PROTECTED_ROUTES` or `AUTH_PAGES` is treated as public.

### Adding a Protected Route
Add the route to the `PROTECTED_ROUTES` array in `/utils/routes.ts`:

```typescript
export const PROTECTED_ROUTES = [
  // ... existing routes
  '/new-protected-route'
];
```

### Adding an Auth Route
Add the route to the `AUTH_PAGES` array in `/utils/routes.ts`:

```typescript
export const AUTH_PAGES = [
  // ... existing routes
  '/auth/new-auth-page'
];
```

## Benefits of This Structure

1. **SEO Friendly**: Marketing and legal pages are publicly accessible for search engines
2. **User Experience**: Users can explore the product without requiring registration
3. **Security**: Financial features remain protected behind authentication
4. **Maintainable**: Centralized route configuration makes it easy to manage
5. **Scalable**: Easy to add new public pages without configuration changes

## Migration Notes

This update changed the routing from a whitelist approach (only specific pages were public) to a blacklist approach (only specific pages require authentication). This means:

- All existing marketing, legal, and informational pages are now public by default
- Only dashboard and financial features require authentication
- No changes needed for most existing pages - they automatically become public
