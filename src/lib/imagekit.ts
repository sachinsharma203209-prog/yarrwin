// ImageKit server-side auth signature for secure client-side uploads.
// The private key never leaves the server — only a short-lived signature is issued.

function bufToHex(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf);
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export interface ImageKitAuth {
  token: string;
  expire: number;
  signature: string;
  publicKey: string;
  urlEndpoint: string;
}

export async function getImageKitAuth(
  privateKey: string,
  publicKey: string,
  urlEndpoint: string
): Promise<ImageKitAuth> {
  const token = crypto.randomUUID().replace(/-/g, "");
  const expire = Math.floor(Date.now() / 1000) + 60 * 30;

  // ImageKit expects the HMAC-SHA1 digest as a lowercase hexadecimal string.
  const message = new TextEncoder().encode(`${token}${expire}`);
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(privateKey),
    { name: "HMAC", hash: "SHA-1" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, message);
  const signature = bufToHex(sig);

  return { token, expire, signature, publicKey, urlEndpoint };
}
