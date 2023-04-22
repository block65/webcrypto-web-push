import { expect, test } from 'vitest';
import { decodeBase64Url } from '../lib/base64.js';
import { hkdf, hkdf2, hkdf3 } from '../lib/hkdf.js';

function fromHex(hex: string): Buffer {
  return Buffer.from(hex, 'hex');
}

function toHex(buff: Buffer | ArrayBuffer): string {
  return Buffer.from(buff).toString('hex');
}

const HKDF_VECTORS = [
  {
    IKM: fromHex('0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b'),
    salt: fromHex('000102030405060708090a0b0c'),
    info: fromHex('f0f1f2f3f4f5f6f7f8f9'),
    L: 42,
    PRK: fromHex(
      '077709362c2e32df0ddc3f0dc47bba6390b6c73bb50f9c3122ec844ad7c2b3e5',
    ),
    OKM: fromHex(
      '3cb25f25faacd57a90434f64d0362f2a2d2d0a90cf1a5a4c5db02d56ecc4c5bf34007208d5b887185865',
    ),
  },

  {
    IKM: fromHex(
      '000102030405060708090a0b0c0d0e0f' +
        '101112131415161718191a1b1c1d1e1f' +
        '202122232425262728292a2b2c2d2e2f' +
        '303132333435363738393a3b3c3d3e3f' +
        '404142434445464748494a4b4c4d4e4f',
    ),
    salt: fromHex(
      '606162636465666768696a6b6c6d6e6f' +
        '707172737475767778797a7b7c7d7e7f' +
        '808182838485868788898a8b8c8d8e8f' +
        '909192939495969798999a9b9c9d9e9f' +
        'a0a1a2a3a4a5a6a7a8a9aaabacadaeaf',
    ),
    info: fromHex(
      'b0b1b2b3b4b5b6b7b8b9babbbcbdbebf' +
        'c0c1c2c3c4c5c6c7c8c9cacbcccdcecf' +
        'd0d1d2d3d4d5d6d7d8d9dadbdcdddedf' +
        'e0e1e2e3e4e5e6e7e8e9eaebecedeeef' +
        'f0f1f2f3f4f5f6f7f8f9fafbfcfdfeff',
    ),
    L: 82,
    PRK: fromHex(
      '06a6b88c5853361a06104c9ceb35b45cef760014904671014a193f40c15fc244',
    ),
    OKM: fromHex(
      'b11e398dc80327a1c8e7f78c596a4934' +
        '4f012eda2d4efad8a050cc4c19afa97c' +
        '59045a99cac7827271cb41c65e590e09' +
        'da3275600c2f09b8367793a9aca3db71' +
        'cc30c58179ec3e87c14c01d5c1f3434f' +
        '1d87',
    ),
  },

  {
    IKM: decodeBase64Url('wV0sNSvW4PviyYKiaVTtPANmaSF7US5g3A5yj4bZeYw'),
    salt: decodeBase64Url('4CQCKEyyOT_LysC17rsMXQ'),
    info: decodeBase64Url(
      'Q29udGVudC1FbmNvZGluZzogYWVzZ2NtAFAtMjU2AABBBDr1dAzf6-X0Hzmq90Q8R85OnZKreVs-7_wRgVKRhswHgO8qgTgywr6jNy_V1lxt7LMyozf65Ube8ShjrFYOFaAAQQTuvkwhyDXgHzIauOEkC50ftzWZwH8Htp_go3BEmx5TnCZMf_Cam3MESTHec62aLiWyFHtgJBZ4aA2r0spjcjgN',
    ),
    L: 16,
    PRK: null,
    OKM: decodeBase64Url('2V6MO66BhBHp0rOUDacExQ'),
  },

  {
    IKM: decodeBase64Url('R4HYOYDZQ5hjpM9OpDh_a_TnNRGapYeSRFPt90gGhdo'),
    salt: decodeBase64Url('4CQCKEyyOT_LysC17rsMXQ'),
    info: decodeBase64Url(
      'Q29udGVudC1FbmNvZGluZzogYWVzZ2NtAFAtMjU2AABBBOLcHOg4ajSHR6BjbSBeX_6aXjMu1V5RrUYXqyV_FqtQSd8RzdU1gkMv1DlRPDIUtFK6Nd16Jql0eSzyZh4V2ucAQQRtzhh65d2CeTx6ZdBkqrQAJVD58dS78ELxTCHOvL4SVOpyJEczxKrQnbkM_MEI9K-9TVT86-2UZNn_n4bEOaSv',
    ),
    L: 16,
    PRK: null,
    OKM: decodeBase64Url('6im_ml2_Ef8hDsrn2xFDoA'),
  },

  {
    IKM: decodeBase64Url('R4HYOYDZQ5hjpM9OpDh_a_TnNRGapYeSRFPt90gGhdo'),
    salt: decodeBase64Url('4CQCKEyyOT_LysC17rsMXQ'),
    info: decodeBase64Url(
      'Q29udGVudC1FbmNvZGluZzogbm9uY2UAUC0yNTYAAEEEOvV0DN_r5fQfOar3RDxHzk6dkqt5Wz7v_BGBUpGGzAeA7yqBODLCvqM3L9XWXG3sszKjN_rlRt7xKGOsVg4VoABBBO6-TCHINeAfMhq44SQLnR-3NZnAfwe2n-CjcESbHlOcJkx_8JqbcwRJMd5zrZouJbIUe2AkFnhoDavSymNyOA0',
    ),
    L: 12,
    PRK: null,
    OKM: decodeBase64Url('2V6MO66BhBHp0rOUDacExQ'),
  },
];

HKDF_VECTORS.forEach((vec, idx) => {
  test.skip(`hkdf ${idx}`, async () => {
    const result = await hkdf(vec.salt, vec.IKM);

    if (vec.PRK) {
      expect(toHex(result.prk)).toBe(toHex(vec.PRK));
    }

    const okm = await result.extract(vec.info, vec.L);
    expect(toHex(okm).slice(0, 32)).toBe(toHex(vec.OKM).slice(0, 32));
  });
});

[
  {
    IKM: decodeBase64Url('R4HYOYDZQ5hjpM9OpDh_a_TnNRGapYeSRFPt90gGhdo'),
    salt: decodeBase64Url('4CQCKEyyOT_LysC17rsMXQ'),
    info: decodeBase64Url(
      'Q29udGVudC1FbmNvZGluZzogbm9uY2UAUC0yNTYAAEEEOvV0DN_r5fQfOar3RDxHzk6dkqt5Wz7v_BGBUpGGzAeA7yqBODLCvqM3L9XWXG3sszKjN_rlRt7xKGOsVg4VoABBBO6-TCHINeAfMhq44SQLnR-3NZnAfwe2n-CjcESbHlOcJkx_8JqbcwRJMd5zrZouJbIUe2AkFnhoDavSymNyOA0',
    ),
    L: 12,
    PRK: null,
    OKM: decodeBase64Url('lqHmAq7DxEmuTQ5f'),
  },
].forEach((vec, idx) => {
  test(`hkdf2 ${idx}`, async () => {
    const result = await hkdf2(vec.salt, vec.IKM);
    const okm = await result.extract(vec.info, vec.L);

    expect(toHex(okm).slice(0, 32)).toBe(toHex(vec.OKM).slice(0, 32));
  });
});

[
  {
    IKM: decodeBase64Url('R4HYOYDZQ5hjpM9OpDh_a_TnNRGapYeSRFPt90gGhdo'),
    salt: decodeBase64Url('4CQCKEyyOT_LysC17rsMXQ'),
    info: decodeBase64Url(
      'Q29udGVudC1FbmNvZGluZzogbm9uY2UAUC0yNTYAAEEEOvV0DN_r5fQfOar3RDxHzk6dkqt5Wz7v_BGBUpGGzAeA7yqBODLCvqM3L9XWXG3sszKjN_rlRt7xKGOsVg4VoABBBO6-TCHINeAfMhq44SQLnR-3NZnAfwe2n-CjcESbHlOcJkx_8JqbcwRJMd5zrZouJbIUe2AkFnhoDavSymNyOA0',
    ),
    L: 12,
    PRK: null,
    OKM: decodeBase64Url('lqHmAq7DxEmuTQ5f'),
  },
].forEach((vec, idx) => {
  test.only(`hkdf3 ${idx}`, async () => {
    const result = await hkdf3(vec.salt, vec.IKM);
    const okm = await result.extract(vec.info, vec.L);
    expect(toHex(okm).slice(0, 32)).toBe(toHex(vec.OKM).slice(0, 32));
  });
});
