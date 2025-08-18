// Firebase connection test utility
export const testFirebaseConnectivity = async (): Promise<{
  success: boolean;
  error?: string;
  details: {
    internetConnectivity: boolean;
    firebaseReachable: boolean;
    authDomainReachable: boolean;
  };
}> => {
  const results = {
    success: false,
    details: {
      internetConnectivity: false,
      firebaseReachable: false,
      authDomainReachable: false,
    },
  };

  try {
    // Test 1: Basic internet connectivity
    console.log('🔍 Testing internet connectivity...');
    try {
      await fetch('https://www.google.com/favicon.ico', {
        method: 'HEAD',
        mode: 'no-cors',
        cache: 'no-cache',
        signal: AbortSignal.timeout(5000)
      });
      results.details.internetConnectivity = true;
      console.log('✅ Internet connectivity: OK');
    } catch (error) {
      console.error('❌ Internet connectivity: FAILED', error);
      return { ...results, error: 'No internet connection detected' };
    }

    // Test 2: Firebase services reachability
    console.log('🔍 Testing Firebase services...');
    try {
      await fetch('https://firebase.googleapis.com/', {
        method: 'HEAD',
        mode: 'no-cors',
        cache: 'no-cache',
        signal: AbortSignal.timeout(5000)
      });
      results.details.firebaseReachable = true;
      console.log('✅ Firebase services: OK');
    } catch (error) {
      console.error('❌ Firebase services: FAILED', error);
    }

    // Test 3: Auth domain reachability
    const authDomain = process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN;
    if (authDomain) {
      console.log(`🔍 Testing auth domain: ${authDomain}`);
      try {
        await fetch(`https://${authDomain}`, {
          method: 'HEAD',
          mode: 'no-cors',
          cache: 'no-cache',
          signal: AbortSignal.timeout(5000)
        });
        results.details.authDomainReachable = true;
        console.log('✅ Auth domain: OK');
      } catch (error) {
        console.error('❌ Auth domain: FAILED', error);
      }
    }

    results.success = results.details.internetConnectivity && 
                     (results.details.firebaseReachable || results.details.authDomainReachable);

    return results;
  } catch (error) {
    console.error('🔥 Connectivity test failed:', error);
    return {
      ...results,
      error: error instanceof Error ? error.message : 'Unknown connectivity error'
    };
  }
};

export const diagnoseFirebaseIssues = async (): Promise<string[]> => {
  const issues: string[] = [];
  
  // Check environment variables
  const requiredEnvVars = [
    'NEXT_PUBLIC_FIREBASE_API_KEY',
    'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
    'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
  ];

  requiredEnvVars.forEach(envVar => {
    if (!process.env[envVar]) {
      issues.push(`Missing environment variable: ${envVar}`);
    }
  });

  // Test connectivity
  const connectivityTest = await testFirebaseConnectivity();
  if (!connectivityTest.success) {
    issues.push(`Connectivity issue: ${connectivityTest.error}`);
  }

  // Check for common configuration issues
  const authDomain = process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN;
  if (authDomain && !authDomain.includes('.firebaseapp.com')) {
    issues.push('Auth domain should end with .firebaseapp.com');
  }

  return issues;
};
