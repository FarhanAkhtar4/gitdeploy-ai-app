/**
 * Cloudflare Workers Environment Bindings
 *
 * This file provides type definitions for Cloudflare-specific
 * bindings available in Edge Runtime (KV, R2, D1, etc.)
 */

interface CloudflareEnv {
  // KV Namespace for caching
  CACHE?: KVNamespace;

  // R2 Bucket for file storage
  STORAGE?: R2Bucket;

  // D1 Database (Cloudflare's SQLite)
  DB?: D1Database;
}

// Extend the global process.env with Cloudflare bindings
declare global {
  interface ProcessEnv {
    // Turso/libSQL
    DATABASE_URL?: string;
    DATABASE_AUTH_TOKEN?: string;

    // Encryption
    ENCRYPTION_KEY?: string;

    // GitHub OAuth
    GITHUB_CLIENT_ID?: string;
    GITHUB_CLIENT_SECRET?: string;
    GITHUB_TOKEN?: string;

    // NextAuth
    NEXTAUTH_SECRET?: string;
    NEXTAUTH_URL?: string;

    // AI
    Z_AI_API_KEY?: string;

    // Cloudflare-specific
    CF_PAGES?: string; // set automatically by Cloudflare Pages
  }

  // Cloudflare context in Pages Functions
  var __CLOUDFLARE_CONTEXT__: {
    env: CloudflareEnv;
    ctx: ExecutionContext;
  };
}

export type { CloudflareEnv };
