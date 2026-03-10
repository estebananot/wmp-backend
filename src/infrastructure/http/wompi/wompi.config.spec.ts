import { getWompiConfig, WompiConfig } from './wompi.config';

describe('WompiConfig', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('should return default config when no env vars', () => {
    delete process.env.WOMPI_API_URL;
    delete process.env.WOMPI_PUBLIC_KEY;
    delete process.env.WOMPI_PRIVATE_KEY;
    delete process.env.WOMPI_INTEGRITY_KEY;
    delete process.env.WOMPI_EVENTS_KEY;
    delete process.env.NODE_ENV;

    const config = getWompiConfig();

    expect(config.apiUrl).toBe('https://sandbox.wompi.co/v1');
  });

  it('should use environment variables when provided', () => {
    process.env.WOMPI_API_URL = 'https://custom.api.com/v1';
    process.env.WOMPI_PUBLIC_KEY = 'pub_test_123';
    process.env.WOMPI_PRIVATE_KEY = 'prv_test_456';
    process.env.WOMPI_INTEGRITY_KEY = 'integrity_test_789';
    process.env.WOMPI_EVENTS_KEY = 'events_test_012';
    process.env.NODE_ENV = 'development';

    const config = getWompiConfig();

    expect(config.apiUrl).toBe('https://custom.api.com/v1');
    expect(config.publicKey).toBe('pub_test_123');
    expect(config.privateKey).toBe('prv_test_456');
    expect(config.integrityKey).toBe('integrity_test_789');
    expect(config.eventsKey).toBe('events_test_012');
  });

  it('should require private key in production', () => {
    process.env.NODE_ENV = 'production';
    process.env.WOMPI_PRIVATE_KEY = '';
    process.env.WOMPI_INTEGRITY_KEY = '';
    process.env.WOMPI_EVENTS_KEY = '';

    expect(() => getWompiConfig()).toThrow(
      'Missing required environment variable: WOMPI_PRIVATE_KEY',
    );
  });
});
