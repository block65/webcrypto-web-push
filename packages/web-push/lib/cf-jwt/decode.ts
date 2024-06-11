import { base64UrlToObject, decodeBase64Url } from './base64.js';
import { ValidationError } from './errors.js';
import type { JwtHeader, JwtPayload } from './jwt.js';

export function decode(token: string) {
  const tokenParts = token.split('.') as [string, string, string];

  if (tokenParts.length !== 3) {
    throw new ValidationError('token must consist of 3 parts').addDetail({
      reason: 'token-format',
      metadata: {
        parts: tokenParts.length,
      },
    });
  }

  const [headerEncoded, payloadEncoded, signatureEncoded] = tokenParts;

  return {
    header: base64UrlToObject<JwtHeader>(headerEncoded),
    payload: base64UrlToObject<JwtPayload>(payloadEncoded),
    signature: decodeBase64Url(signatureEncoded),
    signedData: new TextEncoder().encode(`${headerEncoded}.${payloadEncoded}`),
  };
}
