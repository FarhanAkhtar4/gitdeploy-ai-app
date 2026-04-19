/**
 * AES-256-GCM Encryption — Edge-Compatible
 *
 * Dual-mode support:
 * - Local dev: Node.js crypto (Buffer-based)
 * - Cloudflare/Edge: Web Crypto API (SubtleCrypto)
 *
 * Both produce identical output format: { encrypted, iv, authTag } as hex strings.
 */

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'gitdeploy-ai-default-key-change-in-prod-32ch';
const ALGORITHM = 'AES-256-GCM';
const IV_LENGTH = 12; // 12 bytes for GCM (Web Crypto standard)
const TAG_LENGTH = 16; // 16 bytes auth tag

function getKeyBytes(): Uint8Array {
  const key = ENCRYPTION_KEY.padEnd(32, '0').slice(0, 32);
  return new TextEncoder().encode(key);
}

function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }
  return bytes;
}

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Detect if Web Crypto API is available (Edge Runtime)
 */
function isEdgeRuntime(): boolean {
  return typeof crypto !== 'undefined' && typeof crypto.subtle !== 'undefined';
}

/**
 * Import AES key for Web Crypto API
 */
async function importKey(): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    'raw',
    getKeyBytes(),
    { name: 'AES-GCM' },
    false,
    ['encrypt', 'decrypt']
  );
}

// ─── Edge-compatible encrypt (Web Crypto API) ───
async function encryptEdge(text: string): Promise<{ encrypted: string; iv: string; authTag: string }> {
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));
  const key = await importKey();
  const encoded = new TextEncoder().encode(text);

  const ciphertext = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv, tagLength: TAG_LENGTH * 8 },
    key,
    encoded
  );

  // Web Crypto returns ciphertext + authTag concatenated
  const result = new Uint8Array(ciphertext);
  const encryptedBytes = result.slice(0, result.length - TAG_LENGTH);
  const authTagBytes = result.slice(result.length - TAG_LENGTH);

  return {
    encrypted: bytesToHex(encryptedBytes),
    iv: bytesToHex(iv),
    authTag: bytesToHex(authTagBytes),
  };
}

// ─── Edge-compatible decrypt (Web Crypto API) ───
async function decryptEdge(encrypted: string, iv: string, authTag: string): Promise<string> {
  const key = await importKey();
  const ivBytes = hexToBytes(iv);
  const encryptedBytes = hexToBytes(encrypted);
  const authTagBytes = hexToBytes(authTag);

  // Web Crypto expects ciphertext + authTag concatenated
  const combined = new Uint8Array(encryptedBytes.length + authTagBytes.length);
  combined.set(encryptedBytes);
  combined.set(authTagBytes, encryptedBytes.length);

  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: ivBytes, tagLength: TAG_LENGTH * 8 },
    key,
    combined
  );

  return new TextDecoder().decode(decrypted);
}

// ─── Node.js encrypt (for local dev fallback) ───
async function encryptNode(text: string): Promise<{ encrypted: string; iv: string; authTag: string }> {
  // Dynamic import to avoid bundling in Edge
  const { randomBytes, createCipheriv } = await import('crypto');
  const iv = randomBytes(IV_LENGTH);
  const key = getKeyBytes();
  const cipher = createCipheriv(ALGORITHM, Buffer.from(key), iv);

  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  const authTag = cipher.getAuthTag();

  return {
    encrypted,
    iv: iv.toString('hex'),
    authTag: authTag.toString('hex'),
  };
}

// ─── Node.js decrypt (for local dev fallback) ───
async function decryptNode(encrypted: string, iv: string, authTag: string): Promise<string> {
  const { createDecipheriv } = await import('crypto');
  const key = getKeyBytes();
  const decipher = createDecipheriv(
    ALGORITHM,
    Buffer.from(key),
    Buffer.from(iv, 'hex')
  );

  decipher.setAuthTag(Buffer.from(authTag, 'hex'));

  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}

// ─── Public API (auto-selects Edge vs Node) ───

export async function encrypt(text: string): Promise<{ encrypted: string; iv: string; authTag: string }> {
  if (isEdgeRuntime()) {
    return encryptEdge(text);
  }
  return encryptNode(text);
}

export async function decrypt(encrypted: string, iv: string, authTag: string): Promise<string> {
  if (isEdgeRuntime()) {
    return decryptEdge(encrypted, iv, authTag);
  }
  return decryptNode(encrypted, iv, authTag);
}

export function getTokenHint(token: string): string {
  if (token.length <= 4) return '****';
  return `****${token.slice(-4)}`;
}
