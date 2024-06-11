import {
  assertArray,
  assertObject,
  assertString,
  assertStringKeyInObject,
} from './assert.js';
import { decode } from './decode.js';
import { PermissionError } from './errors.js';
import { algorithms, type JwtAlgorithm } from './jwt-algorithms.js';
import type { JwtPayload, JwtHeader } from './jwt.js';
import { verify } from './verify.js';

export async function verifyJwks<
  P extends JwtPayload,
  H extends JwtHeader = JwtHeader,
>(token: string, jwksUri: URL): Promise<{ header: JwtHeader; payload: P }> {
  if (typeof token !== 'string') {
    throw new Error('token argument must be a string');
  }

  const { header } = decode(token);

  const jwks = await fetch(jwksUri).then((res) => res.json());

  assertObject(jwks);
  assertArray(jwks.keys);

  const key = jwks.keys.find((k) => {
    assertObject(k);
    return k.kid === header.kid;
  });

  if (!key) {
    throw new PermissionError('No usable key found for verification').debug({
      header,
      jwks,
      jwksUri,
    });
  }

  assertObject(key);
  assertStringKeyInObject(key, 'alg');
  assertString<JwtAlgorithm>(key.alg);
  assertStringKeyInObject(key, 'kty');
  assertString(key.kty);

  const algorithm = algorithms[key.alg];

  try {
    const keyData = await crypto.subtle.importKey(
      'jwk',
      key,
      algorithm,
      false,
      ['verify'],
    );
    return await verify<P, H>(token, keyData);
  } catch (err) {
    console.trace('Error importing key', err, key);
    throw err;
  }
}
