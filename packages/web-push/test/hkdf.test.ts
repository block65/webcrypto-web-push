import { expect, test } from 'vitest';
import { hkdf } from '../lib/hkdf.js';
import * as fixtures from './fixtures/vectors.js';

test.each(fixtures.vectors)('hkdf $name', async (vec) => {
  const result = await hkdf(vec.salt, vec.IKM);
  const okm = await result.extract(vec.info, vec.L);

  expect(okm).toEqual(vec.OKM);
});
