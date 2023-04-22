/* eslint-disable max-classes-per-file */
import { type JwtAlgorithm } from './jwt-algorithms.js';

export interface JwtHeader {
  typ: 'JWT';
  alg: JwtAlgorithm;
  kid?: string;
  [key: string]: unknown;
}

export type JwtPayload = {
  /** Issuer */
  iss?: string;

  /** Subject */
  sub?: string;

  /** Audience */
  aud?: string | string[];

  /** Expiration Time */
  exp?: number;

  /** Not Before */
  nbf?: number;

  /** Issued At */
  iat?: number;

  /** JWT ID */
  jti?: string;

  [key: string]: unknown;
};
