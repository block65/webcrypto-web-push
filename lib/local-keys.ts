import { crypto } from './isomorphic-crypto.js';
import { invariant } from './utils.js';

export async function generateLocalKeys() {
  const keyPair = await crypto.subtle.generateKey(
    {
      name: 'ECDH',
      namedCurve: 'P-256',
    },
    true,
    ['deriveBits'],
  );

  // satisfy types
  invariant('publicKey' in keyPair, 'localKeysCurve is not a keypair');

  const publicJwk = await crypto.subtle.exportKey('jwk', keyPair.publicKey);
  const privateJwk = await crypto.subtle.exportKey('jwk', keyPair.privateKey);

  // satisfy types
  invariant('kty' in publicJwk, 'publicJwk is not a JWK');

  return {
    publicKey: await crypto.subtle.importKey(
      'jwk',
      publicJwk,
      { name: 'ECDH', namedCurve: 'P-256' },
      true,
      [],
    ),
    privateKey: keyPair.privateKey,
    publicJwk,
    privateJwk,
  };
}
