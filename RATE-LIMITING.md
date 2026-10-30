## Login failures

Login bypasses the middleware request quotas. The server action uses a separate account counter (normalized email stored only as an HMAC). Only Supabase `invalid_credentials` failures count. Three failures trigger a full 300-second lock beginning at the third failure; blocked retries do not extend it. Successful authentication clears the counter. Page views, successful logins, missing form fields and service errors do not consume login attempts. Accounts have independent counters even when no trusted IP header is configured. Redis outages return an availability message, never a false password-lockout message. Production still requires the Redis settings below.

Configure `RATE_LIMIT_LOGIN_MAX=3` and `RATE_LIMIT_LOGIN_SECONDS=300`. Run `node --test tests/login-limit.test.mjs` for credential failure, expiry, success/reset, identity isolation and outage regression checks.

# Rate limiting

The Next.js middleware protects all page mutations (including Server Actions posted to alternate page URLs), /api/* requests, and filtered/paginated /news requests. Static assets and ordinary public page views do not consume quotas. Authentication still uses verified Supabase claims and staff authorisation/RLS; quotas never grant access.

| Policy | Default | Purpose |
|---|---|---|
| ATTEMPTS | 3 / 300 seconds per identity | One shared quota across non-login page mutations, APIs, uploads and filtered/paginated news |
| INGRESS | 300 / 60 seconds per IP | Coarse pre-authentication guard protecting auth verification work |

Authenticated non-login requests use Supabase user ID; anonymous requests use the trusted client IP. The fourth and subsequent attempts return 429 until exactly 300 seconds after the first attempt. Denied attempts do not extend the window. Different endpoints share the same allowance. Ordinary public page views and static assets remain unrestricted. The exact denial text is: ?The request could not be completed. If you have made several attempts, wait a few minutes before trying again.?

Each policy uses a counter window beginning at the first request, with an atomic Redis EVAL increment + initial expiry + TTL read. Requests beyond the quota do not extend expiry. Concurrent requests share the same counter. Up to a double quota can occur across a window boundary; this is request limiting, not an execution-concurrency semaphore or volumetric DDoS protection.

There are no website password-reset, public sign-up, or AI endpoints. No unused routes were invented. Supabase's directly accessible authentication service needs its own provider-side auth limits/CAPTCHA; website limits cannot protect direct requests to another service. Apply an appropriate new policy before introducing those features.

## Production configuration (required before deployment)

Set server-only RATE_LIMIT_REDIS_URL to an HTTPS Redis REST endpoint supporting Upstash-compatible JSON command bodies and EVAL. Set RATE_LIMIT_REDIS_TOKEN to its restricted credential. EVAL must be permitted for the limiter namespace. Set RATE_LIMIT_KEY_SECRET to a cryptographically random secret of at least 32 bytes, shared by every application instance. Use separate stores/secrets for staging and production. Do not prefix these variables with NEXT_PUBLIC_. No additional Redis library is needed.

Production defaults to Redis and rejects memory mode. Development defaults to a bounded in-process store (10,000 keys), solely for local testing. Never use it for multiple instances. The shared Redis counter is atomic and does not rely on application clocks. Keys contain policy and an HMAC of user ID or IP, not raw personal identifiers, passwords, email, tokens or request bodies. Counters expire automatically.

For overrides use RATE_LIMIT_<POLICY>_MAX and RATE_LIMIT_<POLICY>_SECONDS, for example RATE_LIMIT_ATTEMPTS_MAX=3 and RATE_LIMIT_ATTEMPTS_SECONDS=300. Values must be positive integers. All instances must use the same configuration. Changes apply after process restart/deployment; existing Redis windows retain their initial TTL. Changing the key secret resets identities/counters and should not be used as normal quota adjustment.

## Proxy trust

Next.js does not provide a portable trusted socket IP in middleware. By default no forwarded header is trusted; anonymous clients share the conservative unknown bucket. Before production, select RATE_LIMIT_IP_HEADER only after confirming the ingress overwrites that header and direct origin access is blocked. For a single overwritten header (e.g. x-real-ip), only one valid IP is accepted. Do not blindly trust client-supplied x-forwarded-for.

For x-forwarded-for, RATE_LIMIT_PROXY_HOPS selects a fixed number of trusted hops from the right. Example: client, trusted-proxy with two trusted hops selects the client. Configure using your actual ingress chain; varying/bypassable chains are unsafe. Invalid/missing headers use the unknown bucket. IPv4 and IPv6 are validated and canonicalised. IPv6 addresses use /128 identities; edge-level network-prefix protection is recommended for IPv6 rotation. Never key on unverified user IDs, cookies or bearer payloads; middleware uses Supabase getClaims verification.

## Responses, failures and UX

Quota denials return HTTP 429, Retry-After (seconds), Cache-Control: no-store and a safe JSON error message. Missing/invalid production configuration, Redis timeout, malformed responses, exhausted development memory or Redis failures return HTTP 503 with Retry-After: 30. All protected operations fail closed; there is no silent per-instance fallback. Redis calls time out after two seconds. Ordinary public pages remain available; news query variants, APIs and writes pause until Redis recovers. Authenticated CMS page GETs retain normal authentication behavior.

Uploads show the JSON retry message. Server Action transport failures cannot deliver action state; CMS/login controls catch the transport error and show a generic exact denial message. They do not expose internal exceptions. Retry-After remains available on the HTTP response. No automatic retry of mutations occurs, avoiding duplicate writes.

## Monitoring

Collect structured server warnings with events rate_limit_blocked and rate_limit_store_unavailable. Labels are policy and retry delay only; never append request bodies, URLs/query strings, credentials or identities. Configure log aggregation counters/alerts per policy, alert on any sustained store outage, and investigate spikes in login denials. Apply log-pipeline sampling/aggregation for large floods and restrict retention/access. Check Redis TTL/eviction, latency and capacity. Tune quotas from legitimate staff batch volumes and denial rates; do not simply disable protection. The application emits monitoring events; an external dashboard/alert destination has not been provisioned.

## Verification

Run node --test tests/rate-limit.test.mjs. Tests cover normal traffic, bursts, 20 simultaneous requests with exactly three allowed and a 300-second retry, plus exact five-minute boundary checks for user and IP identities, recovery with an injected clock, isolated identities, shared-store clients, trusted proxy parsing, response status/headers, sensitive-log exclusion, outage behavior, invalid configuration, forbidden production memory, and the Redis REST atomic-command contract. The backend in concurrency tests is a deterministic shared test store, not a live Redis deployment. A real Redis URL/token was not supplied; multi-instance Redis integration and ingress header behavior must be smoke-tested on deployment.

References: https://redis.io/docs/latest/commands/incr/ and https://redis.io/docs/latest/develop/use-cases/rate-limiter/ describe atomic Redis rate counters. Implementation uses Next.js middleware/Response conventions.

### Executed results

- Seven Node tests passed, including burst/concurrency/reset and Redis REST contract checks.
- npm run check passed.
- npm run build passed on Next.js 15.5.28; pre-existing unreachable Supabase queries logged empty-state fallbacks.
- Production HTTP smoke tests passed: homepage 200; login POST, upload POST, filtered news GET and a Server Action POST on /about/ each returned 503 with Retry-After: 30 when Redis was unconfigured. Responses contained no store internals.
- git diff --check passed (Windows line-ending notices only).
- Live Redis, actual ingress trust and authenticated-user integration require deployment credentials/connectivity and were not claimed as tested.
