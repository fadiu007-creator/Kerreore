const required = (name: string) => {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
};

export const env = {
  get supabaseUrl() { return required("NEXT_PUBLIC_SUPABASE_URL"); },
  get supabaseAnonKey() { return required("NEXT_PUBLIC_SUPABASE_ANON_KEY"); },
  get stripeSecretKey() { return required("STRIPE_SECRET_KEY"); },
  get stripeWebhookSecret() { return required("STRIPE_WEBHOOK_SECRET"); },
  get appUrl() { return process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"; },
};
