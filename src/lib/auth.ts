import { getSetting, setSetting } from "./db";

function bufToHex(buf: ArrayBuffer): string {
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

function hexToBuf(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hex.substr(i * 2, 2), 16);
  }
  return bytes;
}

function randomHex(bytes: number): string {
  const buf = new Uint8Array(bytes);
  crypto.getRandomValues(buf);
  return [...buf].map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function pbkdf2(password: string, salt: Uint8Array, iterations = 120000): Promise<string> {
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "PBKDF2",
    false,
    ["deriveBits"]
  );
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt: salt as BufferSource, iterations, hash: "SHA-256" },
    keyMaterial,
    256
  );
  return bufToHex(bits);
}

export async function hashPassword(password: string): Promise<{ hash: string; salt: string }> {
  const salt = randomHex(16);
  const hash = await pbkdf2(password, hexToBuf(salt));
  return { hash, salt };
}

export async function verifyPassword(password: string, hash: string, salt: string): Promise<boolean> {
  if (!hash || !salt) return false;
  const test = await pbkdf2(password, hexToBuf(salt));
  return test === hash;
}

export async function initAdmin(db: D1Database, username: string, password: string): Promise<void> {
  const { hash, salt } = await hashPassword(password);
  await setSetting(db, "admin_username", username);
  await setSetting(db, "admin_password_hash", hash);
  await setSetting(db, "admin_password_salt", salt);
}

export async function verifyLogin(db: D1Database, username: string, password: string): Promise<boolean> {
  const storedUsername = await getSetting(db, "admin_username");
  const hash = await getSetting(db, "admin_password_hash");
  const salt = await getSetting(db, "admin_password_salt");
  if (!storedUsername || !hash || !salt) return false;
  if (username !== storedUsername) return false;
  return verifyPassword(password, hash, salt);
}

// --- Session handling (signed cookie, stateless) ---
export async function createSessionToken(db: D1Database): Promise<string> {
  const secret = await getSetting(db, "session_secret");
  if (!secret) {
    const newSecret = randomHex(32);
    await setSetting(db, "session_secret", newSecret);
    return createSessionToken(db);
  }
  const payload = `${Date.now()}:${randomHex(8)}`;
  const sig = bufToHex(
    await crypto.subtle.digest("SHA-256", new TextEncoder().encode(`${payload}:${secret}`))
  );
  return `${payload}.${sig}`;
}

export async function verifySessionToken(db: D1Database, token: string | undefined): Promise<boolean> {
  if (!token) return false;
  const parts = token.split(".");
  if (parts.length !== 2) return false;
  const [payload, sig] = parts;
  const secret = await getSetting(db, "session_secret");
  if (!secret) return false;
  const ts = Number(payload.split(":")[0]);
  if (!ts || Date.now() - ts > 7 * 24 * 60 * 60 * 1000) return false;
  const expected = bufToHex(
    await crypto.subtle.digest("SHA-256", new TextEncoder().encode(`${payload}:${secret}`))
  );
  return expected === sig;
}

export function parseCookies(header: string | null): Record<string, string> {
  const out: Record<string, string> = {};
  if (!header) return out;
  for (const part of header.split(";")) {
    const eq = part.indexOf("=");
    if (eq === -1) continue;
    const k = part.slice(0, eq).trim();
    let v = part.slice(eq + 1).trim();
    // Astro URL-encodes cookie values (e.g. ":" -> "%3A"); decode before use.
    try {
      v = decodeURIComponent(v);
    } catch {
      /* keep raw on malformed encoding */
    }
    if (k) out[k] = v;
  }
  return out;
}
