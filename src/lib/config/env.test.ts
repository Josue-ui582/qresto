import { describe, expect, it } from 'vitest';
import { parseAppConfig } from './env';

const validStagingEnvironment: NodeJS.ProcessEnv = {
  NODE_ENV: 'test',
  APP_ENV: 'staging',
  DATABASE_URL: 'postgresql://demo:demo@ep-demo-pooler.neon.tech/qresto?sslmode=require',
  DIRECT_URL: 'postgresql://demo:demo@ep-demo.neon.tech/qresto?sslmode=require',
  JWT_SECRET: 'test-secret-with-more-than-thirty-two-characters',
  NEXT_PUBLIC_APP_URL: 'https://qresto-demo.vercel.app',
  STORAGE_PROVIDER: 'cloudinary',
  CLOUDINARY_CLOUD_NAME: 'qresto-demo',
  CLOUDINARY_API_KEY: 'test-api-key',
  CLOUDINARY_API_SECRET: 'test-api-secret',
  DEMO_OWNER_PASSWORD: 'strong-demo-password',
};

describe('parseAppConfig', () => {
  it('treats blank optional entries in .env.example as unset defaults', () => {
    const config = parseAppConfig({
      NODE_ENV: 'test',
      APP_ENV: '',
      DATABASE_URL: validStagingEnvironment.DATABASE_URL,
      DIRECT_URL: validStagingEnvironment.DIRECT_URL,
      JWT_SECRET: validStagingEnvironment.JWT_SECRET,
      NEXT_PUBLIC_APP_URL: validStagingEnvironment.NEXT_PUBLIC_APP_URL,
      STORAGE_PROVIDER: '',
      WHATSAPP_PROVIDER: '',
      PAYMENT_PROVIDER: '',
      ALLOW_REAL_PROVIDERS_IN_STAGING: '',
      DEMO_OWNER_EMAIL: '',
    });

    expect(config.APP_ENV).toBe('development');
    expect(config.STORAGE_PROVIDER).toBe('local');
    expect(config.DEMO_OWNER_EMAIL).toBe('demo@qresto.example');
  });

  it('accepts a fully configured staging environment', () => {
    expect(parseAppConfig(validStagingEnvironment).APP_ENV).toBe('staging');
  });

  it('requires an explicit non-development app environment in production', () => {
    expect(() => parseAppConfig({
      ...validStagingEnvironment,
      NODE_ENV: 'production',
      APP_ENV: '',
    })).toThrow(/APP_ENV/);
  });

  it('requires explicit authorization before staging can start with a real provider', () => {
    expect(() => parseAppConfig({
      ...validStagingEnvironment,
      WHATSAPP_PROVIDER: 'real',
    })).toThrow(/ALLOW_REAL_PROVIDERS_IN_STAGING/);

    expect(parseAppConfig({
      ...validStagingEnvironment,
      WHATSAPP_PROVIDER: 'real',
      ALLOW_REAL_PROVIDERS_IN_STAGING: 'true',
    }).WHATSAPP_PROVIDER).toBe('real');
  });

  it('rejects local image storage in staging', () => {
    expect(() => parseAppConfig({
      ...validStagingEnvironment,
      STORAGE_PROVIDER: 'local',
    })).toThrow(/STORAGE_PROVIDER=cloudinary/);
  });

  it('reports invalid variable names without echoing their values', () => {
    let message = '';
    try {
      parseAppConfig({
        ...validStagingEnvironment,
        JWT_SECRET: 'private-test-value',
      });
    } catch (error: unknown) {
      message = error instanceof Error ? error.message : '';
    }

    expect(message).toContain('JWT_SECRET');
    expect(message).not.toContain('private-test-value');
  });
});
