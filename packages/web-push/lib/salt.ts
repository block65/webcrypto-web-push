export async function getSalt() {
  return crypto.getRandomValues(new Uint8Array(16));
}
