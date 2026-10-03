/**
 * Client IP resolution for the chat API.
 *
 * Designed for deployments behind a reverse proxy / CDN
 * (e.g. Cloudflare → Coolify/Traefik → Next.js).
 *
 * `cf-connecting-ip` is the real client IP **only if** Cloudflare is the sole
 * path to the origin. Enforce that at the network layer (only allow :443 from
 * Cloudflare's IP ranges). If the origin is reachable directly, an attacker can
 * forge this header — which is exactly why we never trust the *first* entry of
 * `x-forwarded-for`.
 */
export function getClientIp(req: Request): string {
  // Set by Cloudflare and overwritten on every request (not client-forgeable
  // when the origin is locked down).
  const cf = req.headers.get('cf-connecting-ip');
  if (cf?.trim()) return cf.trim();

  // Rewritten by the reverse proxy (e.g. Traefik) to the immediate peer.
  const real = req.headers.get('x-real-ip');
  if (real?.trim()) return real.trim();

  // Fallback: rightmost hop (nearest trusted proxy), never the leftmost.
  const xff = req.headers.get('x-forwarded-for');
  if (xff) {
    const hops = xff
      .split(',')
      .map((p) => p.trim())
      .filter(Boolean);
    if (hops.length > 0) return hops[hops.length - 1];
  }

  return 'unknown';
}
