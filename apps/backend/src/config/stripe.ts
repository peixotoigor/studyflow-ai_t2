import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  console.warn('[Stripe] Warning: STRIPE_SECRET_KEY is not defined in environment variables.');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-01-27.acacia' as any, // fallback or cast to any to avoid version mismatches in types
});
