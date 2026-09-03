export async function generateLocalKeys() {
  const keyPair = await crypto.subtle.generateKey(
    {
      name: 'ECDH',
      namedCurve: 'P-256',
    },
    false,
    ['deriveBits'],
  );

  return {
    privateKey: keyPair.privateKey,
    publicKeyBytes: new Uint8Array(
      await crypto.subtle.exportKey('raw', keyPair.publicKey),
    ),
  };
}
