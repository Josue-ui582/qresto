import { z } from 'zod';

const appEnvironmentSchema = z.enum(['development', 'staging', 'production']);
const providerSchema = z.enum(['simulated', 'real']);

const environmentSchema = z.object({
  APP_ENV: appEnvironmentSchema.default('development'),
  DATABASE_URL: z.string().min(1).refine(isPostgresUrl, 'doit être une URL PostgreSQL'),
  DIRECT_URL: z.string().min(1).refine(isPostgresUrl, 'doit être une URL PostgreSQL'),
  JWT_SECRET: z.string().trim().min(32, 'doit contenir au moins 32 caractères'),
  NEXT_PUBLIC_APP_URL: z.string().url(),
  STORAGE_PROVIDER: z.enum(['local', 'cloudinary']).default('local'),
  UPLOADS_DIRECTORY: z.string().optional(),
  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),
  WHATSAPP_PROVIDER: providerSchema.default('simulated'),
  PAYMENT_PROVIDER: providerSchema.default('simulated'),
  ALLOW_REAL_PROVIDERS_IN_STAGING: z.enum(['true', 'false']).default('false'),
  DEMO_OWNER_PASSWORD: z.string().trim().min(12, 'doit contenir au moins 12 caractères').optional(),
  DEMO_OWNER_EMAIL: z.string().email().default('demo@qresto.example'),
});

export type AppEnvironment = z.infer<typeof appEnvironmentSchema>;
export type AppConfig = z.infer<typeof environmentSchema>;

function isPostgresUrl(value: string): boolean {
  try {
    const protocol = new URL(value).protocol;
    return protocol === 'postgres:' || protocol === 'postgresql:';
  } catch {
    return false;
  }
}

export function parseAppConfig(environment: NodeJS.ProcessEnv): AppConfig {
  const normalizedEnvironment = Object.fromEntries(
    Object.entries(environment).map(([name, value]) => [name, value === '' ? undefined : value])
  );
  const parsed = environmentSchema.safeParse(normalizedEnvironment);
  if (!parsed.success) {
    const details = parsed.error.issues
      .map((issue) => `${issue.path.join('.') || 'environment'}: ${issue.message}`)
      .join('; ');
    throw new Error(`Configuration d’environnement invalide : ${details}`);
  }

  const config = parsed.data;
  if (environment.NODE_ENV === 'production' && config.APP_ENV === 'development') {
    throw new Error(
      'Configuration d’environnement invalide : APP_ENV doit être défini à staging ou production pour un serveur de production.'
    );
  }
  const realProviderConfigured =
    config.WHATSAPP_PROVIDER === 'real' || config.PAYMENT_PROVIDER === 'real';
  if (
    config.APP_ENV === 'staging' &&
    realProviderConfigured &&
    config.ALLOW_REAL_PROVIDERS_IN_STAGING !== 'true'
  ) {
    throw new Error(
      'Configuration d’environnement invalide : les fournisseurs réels sont interdits en staging sans ALLOW_REAL_PROVIDERS_IN_STAGING=true.'
    );
  }
  if (config.APP_ENV === 'staging' && config.STORAGE_PROVIDER !== 'cloudinary') {
    throw new Error(
      'Configuration d’environnement invalide : STORAGE_PROVIDER=cloudinary est obligatoire en staging.'
    );
  }
  if (
    config.STORAGE_PROVIDER === 'cloudinary' &&
    (!config.CLOUDINARY_CLOUD_NAME || !config.CLOUDINARY_API_KEY || !config.CLOUDINARY_API_SECRET)
  ) {
    throw new Error(
      'Configuration d’environnement invalide : CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY et CLOUDINARY_API_SECRET sont requis avec STORAGE_PROVIDER=cloudinary.'
    );
  }
  if (config.APP_ENV === 'staging' && !config.DEMO_OWNER_PASSWORD) {
    throw new Error(
      'Configuration d’environnement invalide : DEMO_OWNER_PASSWORD est requis en staging pour le seed de démonstration.'
    );
  }

  return config;
}

let appConfig: AppConfig | undefined;

export function getAppConfig(): AppConfig {
  appConfig ??= parseAppConfig(process.env);
  return appConfig;
}
