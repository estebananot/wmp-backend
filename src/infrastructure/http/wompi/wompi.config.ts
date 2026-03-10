export interface WompiConfig {
  apiUrl: string;
  publicKey: string;
  privateKey: string;
  integrityKey: string;
  eventsKey: string;
}

const getRequiredEnv = (key: string): string => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
};

export const getWompiConfig = (): WompiConfig => {
  const isProduction = process.env.NODE_ENV === 'production';

  return {
    apiUrl:
      process.env.WOMPI_API_URL || 'https://api-sandbox.co.uat.wompi.dev/v1',
    publicKey: process.env.WOMPI_PUBLIC_KEY || '',
    privateKey: isProduction
      ? getRequiredEnv('WOMPI_PRIVATE_KEY')
      : process.env.WOMPI_PRIVATE_KEY || '',
    integrityKey: isProduction
      ? getRequiredEnv('WOMPI_INTEGRITY_KEY')
      : process.env.WOMPI_INTEGRITY_KEY || '',
    eventsKey: isProduction
      ? getRequiredEnv('WOMPI_EVENTS_KEY')
      : process.env.WOMPI_EVENTS_KEY || '',
  };
};
