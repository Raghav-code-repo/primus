import 'dotenv/config';

function getRequiredEnv(name: string): string {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

function getPort(): number {
  const port = Number(process.env.NODE_PORT ?? 8091);

  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error(`Invalid NODE_PORT: ${process.env.NODE_PORT}`);
  }

  return port;
}

function getAllowedOrigins(): string[] {
  return (process.env.CORS_ALLOWED_ORIGINS ?? 'http://localhost:5173')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
}

const jwtSecretEncoding = (
  process.env.JWT_SECRET_ENCODING ?? 'base64'
).trim().toLowerCase();

if (!['base64', 'utf8'].includes(jwtSecretEncoding)) {
  throw new Error(
    'JWT_SECRET_ENCODING must be either "base64" or "utf8"'
  );
}

export const config = {
  port: getPort(),

  jwtSecret: getRequiredEnv('JWT_SECRET'),

  jwtSecretEncoding: jwtSecretEncoding as 'base64' | 'utf8',

  allowedOrigins: getAllowedOrigins(),
};