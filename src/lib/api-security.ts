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

/**
 * Mask an IP for logs (LGPD/GDPR data minimisation): IPv4 keeps /24,
 * IPv6 keeps /48. Rate limiting still uses the full IP, in memory only.
 */
export function anonymizeIp(ip: string): string {
  if (ip.includes('.') && !ip.includes(':')) {
    const parts = ip.split('.');
    return parts.length === 4 ? `${parts.slice(0, 3).join('.')}.0` : 'unknown';
  }
  if (ip.includes(':')) {
    return `${ip.split(':').slice(0, 3).join(':')}::`;
  }
  return 'unknown';
}

/**
 * Browsers send `Sec-Fetch-Site`; reject cross-site calls so other sites
 * cannot embed the chat and spend our LLM quota through visitors' browsers.
 * Non-browser clients omit the header and are covered by rate limiting.
 */
export function isCrossSiteRequest(req: Request): boolean {
  return req.headers.get('sec-fetch-site') === 'cross-site';
}

/**
 * Read a JSON body enforcing a real byte cap — `Content-Length` can be
 * absent (chunked) or wrong, so count bytes while streaming.
 */
export async function readJsonWithLimit(
  req: Request,
  maxBytes: number,
): Promise<{ ok: true; body: unknown } | { ok: false; status: 400 | 413 }> {
  if (!req.body) return { ok: false, status: 400 };
  const reader = req.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > maxBytes) {
      await reader.cancel();
      return { ok: false, status: 413 };
    }
    chunks.push(value);
  }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const c of chunks) {
    bytes.set(c, offset);
    offset += c.byteLength;
  }
  try {
    return { ok: true, body: JSON.parse(new TextDecoder().decode(bytes)) };
  } catch {
    return { ok: false, status: 400 };
  }
}
