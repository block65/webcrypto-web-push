export type JwtAlgorithm =
  | 'ES256'
  | 'ES384'
  | 'ES512'
  | 'HS256'
  | 'HS384'
  | 'HS512'
  | 'RS256'
  | 'RS384'
  | 'RS512';

interface Algorithm {
  name: string;
}

type NamedCurve = string;
interface EcKeyImportParams extends Algorithm {
  namedCurve: NamedCurve;
}

type AlgorithmIdentifier = Algorithm | string;
type HashAlgorithmIdentifier = AlgorithmIdentifier;
interface RsaHashedImportParams extends Algorithm {
  hash: HashAlgorithmIdentifier;
}

interface HmacImportParams extends Algorithm {
  hash: HashAlgorithmIdentifier;
  length?: number;
}

export const algorithms: Record<
  JwtAlgorithm,
  RsaHashedImportParams | EcKeyImportParams | HmacImportParams
> = {
  ES256: { name: 'ECDSA', namedCurve: 'P-256', hash: { name: 'SHA-256' } },
  ES384: { name: 'ECDSA', namedCurve: 'P-384', hash: { name: 'SHA-384' } },
  ES512: { name: 'ECDSA', namedCurve: 'P-521', hash: { name: 'SHA-512' } },
  HS256: { name: 'HMAC', hash: { name: 'SHA-256' } },
  HS384: { name: 'HMAC', hash: { name: 'SHA-384' } },
  HS512: { name: 'HMAC', hash: { name: 'SHA-512' } },
  RS256: { name: 'RSASSA-PKCS1-v1_5', hash: { name: 'SHA-256' } },
  RS384: { name: 'RSASSA-PKCS1-v1_5', hash: { name: 'SHA-384' } },
  RS512: { name: 'RSASSA-PKCS1-v1_5', hash: { name: 'SHA-512' } },
};
