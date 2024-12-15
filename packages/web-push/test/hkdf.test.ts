import { expect, test } from 'vitest';
import { hkdf } from '../lib/hkdf.js';
import * as fixtures from './fixtures/vectors.js';

test.each(fixtures.vectors)('hkdf2 $name', async (vec) => {
  const result = await hkdf(vec.salt, vec.IKM);
  const okm = await result.extract(vec.info, vec.L);

  expect(okm.slice(0, 32)).toEqual(vec.OKM.buffer.slice(0, 32));
});
