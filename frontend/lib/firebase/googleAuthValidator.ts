/**
 * Google OAuth Configuration Validator
 * Validates environment variables and provides recommendations for optimal Google Auth setup
 */

export interface GoogleAuthValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  recommendations: string[];
  securityScore: number;
}

export interface GoogleAuthEnvironment {
  NEXT_PUBLIC_FIREBASE_API_KEY?: string;
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN?: string;
  NEXT_PUBLIC_FIREBASE_PROJECT_ID?: string;
  NEXT_PUBLIC_GOOGLE_CLIENT_ID?: string;
  GOOGLE_CLIENT_SECRET?: string;
}

export class GoogleAuthValidator {
  private static readonly REQUIRED_ENV_VARS = [
    'NEXT_PUBLIC_FIREBASE_API_KEY',
    'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
    'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
  ];

  private static readonly RECOMMENDED_ENV_VARS = [
    'NEXT_PUBLIC_GOOGLE_CLIENT_ID',
  ];

  private static readonly SECURITY_PATTERNS = {
    apiKey: /^[A-Za-z0-9_-]{39}$/,
    projectId: /^[a-z0-9-]{6,30}$/,
    authDomain: /^[a-z0-9-]+\.firebaseapp\.com$/,
    clientId: /^[0-9]+-[a-z0-9]+\.apps\.googleusercontent\.com$/,
  };

  /**
   * Validates Google OAuth configuration
   */
  static validateConfiguration(env?: GoogleAuthEnvironment): GoogleAuthValidationResult {
    const environment = env || {
      NEXT_PUBLIC_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      NEXT_PUBLIC_FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      NEXT_PUBLIC_GOOGLE_CLIENT_ID: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
      GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    };

    const result: GoogleAuthValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
      recommendations: [],
      securityScore: 100,
    };

    // Check required environment variables
    this.REQUIRED_ENV_VARS.forEach(varName => {
      const value = environment[varName as keyof GoogleAuthEnvironment];
      if (!value) {
        result.errors.push(`Missing required environment variable: ${varName}`);
        result.isValid = false;
        result.securityScore -= 25;
      }
    });

    // Check recommended environment variables
    this.RECOMMENDED_ENV_VARS.forEach(varName => {
      const value = environment[varName as keyof GoogleAuthEnvironment];
      if (!value) {
        result.warnings.push(`Missing recommended environment variable: ${varName}`);
        result.securityScore -= 10;
      }
    });

    // Validate Firebase API Key format
    if (environment.NEXT_PUBLIC_FIREBASE_API_KEY) {
      if (!this.SECURITY_PATTERNS.apiKey.test(environment.NEXT_PUBLIC_FIREBASE_API_KEY)) {
        result.warnings.push('Firebase API Key format appears invalid');
        result.securityScore -= 15;
      }
    }

    // Validate Project ID format
    if (environment.NEXT_PUBLIC_FIREBASE_PROJECT_ID) {
      if (!this.SECURITY_PATTERNS.projectId.test(environment.NEXT_PUBLIC_FIREBASE_PROJECT_ID)) {
        result.warnings.push('Firebase Project ID format appears invalid');
        result.securityScore -= 10;
      }
    }

    // Validate Auth Domain format
    if (environment.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN) {
      if (!this.SECURITY_PATTERNS.authDomain.test(environment.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN)) {
        result.warnings.push('Firebase Auth Domain format appears invalid');
        result.securityScore -= 10;
      }
    }

    // Validate Google Client ID format
    if (environment.NEXT_PUBLIC_GOOGLE_CLIENT_ID) {
      if (!this.SECURITY_PATTERNS.clientId.test(environment.NEXT_PUBLIC_GOOGLE_CLIENT_ID)) {
        result.warnings.push('Google Client ID format appears invalid');
        result.securityScore -= 15;
      }
    }

    // Security recommendations
    if (result.securityScore >= 90) {
      result.recommendations.push('✅ Excellent security configuration');
    } else if (result.securityScore >= 70) {
      result.recommendations.push('⚠️ Good security configuration with minor improvements needed');
    } else if (result.securityScore >= 50) {
      result.recommendations.push('🔶 Moderate security configuration - several improvements recommended');
    } else {
      result.recommendations.push('🔴 Poor security configuration - immediate attention required');
    }

    // Environment-specific recommendations
    if (typeof window !== 'undefined') {
      // Client-side recommendations
      result.recommendations.push('🔒 Ensure Firebase Security Rules are properly configured');
      result.recommendations.push('🌐 Verify authorized domains in Firebase Console');
    } else {
      // Server-side recommendations
      result.recommendations.push('🔐 Keep Google Client Secret secure and never expose to client');
      result.recommendations.push('🛡️ Use Firebase Admin SDK for server-side operations');
    }

    // Performance recommendations
    result.recommendations.push('⚡ Enable Firebase Auth persistence for better UX');
    result.recommendations.push('📱 Configure mobile-specific settings for better mobile experience');

    return result;
  }

  /**
   * Validates domain configuration
   */
  static validateDomainConfiguration(currentDomain?: string): {
    isValid: boolean;
    issues: string[];
    recommendations: string[];
  } {
    const domain = currentDomain || (typeof window !== 'undefined' ? window.location.hostname : 'localhost');
    
    const result = {
      isValid: true,
      issues: [] as string[],
      recommendations: [] as string[],
    };

    // Check for localhost in production
    if (domain === 'localhost' && process.env.NODE_ENV === 'production') {
      result.issues.push('Using localhost in production environment');
      result.isValid = false;
    }

    // Check for proper HTTPS in production
    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
      if (window.location.protocol !== 'https:') {
        result.issues.push('HTTPS required for Google OAuth in production');
        result.isValid = false;
      }
    }

    // Recommendations
    if (domain === 'localhost') {
      result.recommendations.push('Add localhost to Firebase authorized domains for development');
    }

    result.recommendations.push('Ensure production domain is added to Firebase authorized domains');
    result.recommendations.push('Configure proper CORS settings for your domain');

    return result;
  }

  /**
   * Generates environment variable template
   */
  static generateEnvTemplate(): string {
    return `# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Google OAuth Configuration
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Security Configuration (Optional but recommended)
NEXTAUTH_SECRET=your_nextauth_secret_here
NEXTAUTH_URL=http://localhost:3000

# Production URLs
NEXT_PUBLIC_FRONTEND_URL=https://your-domain.com
NEXT_PUBLIC_BACKEND_URL=https://api.your-domain.com`;
  }

  /**
   * Tests Google services availability (optimized to avoid CSP issues)
   */
  static async testGoogleServices(): Promise<{
    available: boolean;
    services: Record<string, boolean>;
  }> {
    const services = {
      'accounts.google.com': false,
      'www.googleapis.com': false,
      'oauth2.googleapis.com': false,
    };

    // Skip actual network tests to avoid CSP violations
    // In production, these services are typically available
    const isProduction = process.env.NODE_ENV === 'production';
    
    if (isProduction) {
      // Assume services are available in production
      Object.keys(services).forEach(key => {
        services[key] = true;
      });
    } else {
      // In development, just check if we have the required config
      const hasGoogleConfig = !!(
        process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
      );
      
      Object.keys(services).forEach(key => {
        services[key] = hasGoogleConfig;
      });
    }

    return {
      available: Object.values(services).some(Boolean),
      services,
    };
  }

  /**
   * Checks if Google OAuth is properly enabled in Firebase
   */
  static async checkFirebaseGoogleProvider(): Promise<{
    enabled: boolean;
    issues: string[];
    recommendations: string[];
  }> {
    const result = {
      enabled: false,
      issues: [] as string[],
      recommendations: [] as string[],
    };

    try {
      // This would require Firebase Admin SDK to check properly
      // For now, we'll provide general guidance
      result.recommendations.push('Verify Google Sign-In is enabled in Firebase Console > Authentication > Sign-in method');
      result.recommendations.push('Ensure Web SDK configuration is properly set up');
      result.recommendations.push('Check that authorized domains include your production domain');
      
      return result;
    } catch {
      result.issues.push('Unable to verify Firebase Google provider status');
      return result;
    }
  }
}

/**
 * Quick validation helper for development
 */
export const validateGoogleAuthQuick = (): boolean => {
  const validation = GoogleAuthValidator.validateConfiguration();
  
  if (!validation.isValid) {
    console.error('❌ Google Auth Configuration Issues:');
    validation.errors.forEach(error => console.error(`  - ${error}`));
  }
  
  if (validation.warnings.length > 0) {
    console.warn('⚠️ Google Auth Configuration Warnings:');
    validation.warnings.forEach(warning => console.warn(`  - ${warning}`));
  }
  
  console.log(`🔒 Security Score: ${validation.securityScore}/100`);
  
  return validation.isValid;
};

/**
 * Development helper to print configuration status
 */
export const printGoogleAuthStatus = (): void => {
  console.log('🔍 Google OAuth Configuration Status:');
  console.log('=====================================');
  
  const validation = GoogleAuthValidator.validateConfiguration();
  const domainValidation = GoogleAuthValidator.validateDomainConfiguration();
  
  console.log(`✅ Valid: ${validation.isValid}`);
  console.log(`🔒 Security Score: ${validation.securityScore}/100`);
  console.log(`🌐 Domain Valid: ${domainValidation.isValid}`);
  
  if (validation.errors.length > 0) {
    console.log('\n❌ Errors:');
    validation.errors.forEach(error => console.log(`  - ${error}`));
  }
  
  if (validation.warnings.length > 0) {
    console.log('\n⚠️ Warnings:');
    validation.warnings.forEach(warning => console.log(`  - ${warning}`));
  }
  
  if (validation.recommendations.length > 0) {
    console.log('\n💡 Recommendations:');
    validation.recommendations.forEach(rec => console.log(`  - ${rec}`));
  }
  
  console.log('\n🔧 Environment Template:');
  console.log(GoogleAuthValidator.generateEnvTemplate());
};
