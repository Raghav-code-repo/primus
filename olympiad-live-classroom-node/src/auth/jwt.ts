import jwt, { type JwtPayload } from 'jsonwebtoken';
import { Buffer } from 'node:buffer';
import { config } from '../config/env.js';

export interface AuthClaims {
  userId: string;
  email: string;
  roles: string[];
}

function getSigningKey(): Buffer {
  const secret = config.jwtSecret;

  const key =
    config.jwtSecretEncoding === 'base64'
      ? Buffer.from(secret, 'base64')
      : Buffer.from(secret, 'utf8');

  if (key.length < 32) {
    throw new Error(
      'JWT signing key is too short for HS256. It must contain at least 32 bytes.'
    );
  }

  return key;
}

export function verifyToken(token: string): AuthClaims {
  if (!token || typeof token !== 'string') {
    throw new Error('Missing JWT token');
  }

  const key = getSigningKey();

  const decoded = jwt.verify(token, key, {
    algorithms: ['HS256'],
    clockTolerance: 5,
  });

  if (
    typeof decoded !== 'object' ||
    decoded === null ||
    Array.isArray(decoded)
  ) {
    throw new Error('Invalid JWT payload');
  }

  const payload = decoded as JwtPayload & Record<string, unknown>;

  const userId =
    typeof payload.userId === 'string'
      ? payload.userId.trim()
      : '';

  const email =
    typeof payload.sub === 'string'
      ? payload.sub.trim()
      : typeof payload.email === 'string'
        ? payload.email.trim()
        : '';

  const roles = Array.isArray(payload.roles)
    ? payload.roles
    : [];

  if (!userId) {
    throw new Error('JWT userId claim is missing');
  }

  if (!email) {
    throw new Error('JWT subject/email claim is missing');
  }

  if (!roles.every((role) => typeof role === 'string')) {
    throw new Error('JWT roles claim has an invalid format');
  }

  return {
    userId,
    email,
    roles: roles.map((role) => role.trim()).filter(Boolean),
  };
}