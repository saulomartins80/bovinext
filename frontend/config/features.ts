export const ENABLE_STRIPE = (process.env.NEXT_PUBLIC_ENABLE_STRIPE || 'false').toLowerCase() === 'true';
export const ENABLE_GOOGLE_ANALYTICS = (process.env.NEXT_PUBLIC_ENABLE_GA || 'false').toLowerCase() === 'true';
