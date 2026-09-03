import { stringToUint8Array } from 'uint8array-extras';
import { objectToBase64Url, encodeBase64Url } from './base64.js';

interface JwtPayload {
  iss?: string;
  sub?: string;
  aud?: string | string[];
  exp?: number;
  nbf?: number;
  iat?: number;
  jti?: string;
  [key: string]: unknown;
}

// VAPID is always ES256, see RFC 8292 §2
export async function sign(payload: JwtPayload, key: CryptoKey) {
  const headerStr = objectToBase64Url({
    typ: 'JWT',
    alg: 'ES256',
  });

  const payloadStr = objectToBase64Url<JwtPayload>({
    iat: Math.floor(Date.now() / 1000),
    ...payload,
  });

  const dataStr = `${headerStr}.${payloadStr}`;

  const signature = await crypto.subtle.sign(
    {
      name: 'ECDSA',
      hash: 'SHA-256',
    },
    key,
    stringToUint8Array(dataStr),
  );

  return `${dataStr}.${encodeBase64Url(signature)}`;
}
