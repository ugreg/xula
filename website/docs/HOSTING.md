# Provider

- Porkbun static hosting: CNAME to `ss1-sixie.porkbun.com`, `server: openresty`, `x-service: pixie-sh`.
- [GitHub Connect](https://kb.porkbun.com/article/145-how-to-connect-static-hosting-to-github), pushes latest branch, no purge endpoint.

> [!IMPORTANT]
> If Porkbun ever ships header or purge control, this doc needs
> to be updated. The URL is the fallback lever either way.

"Porkbun hard-codes 30-day `max-age` and gives no header control" is not from a Porkbun doc.

documented by porkbun:

- the [static hosting KB article](https://kb.porkbun.com/article/137-how-to-set-up-static-hosting) (last updated 2025-08-15) covers plan selection, the file editor, FTP, GitHub Connect, and a 40MB upload limit. its body has zero mentions of cache, `max-age`, purge, or invalidation.
- the [hosting API reference](https://porkbun.com/llms/hosting) (API v3.64) has zero mentions of cache, `max-age`, purge, or invalidation. static-hosting file endpoints are `deploy`, `files`, `makeDir`, `deleteFile`; `plans`/`create`/`get`/`delete` are shared with Cloud for WordPress, which also adds `createWpCredentials`/`getWpCredentials`/`deleteWpCredentials`. no purge or invalidation endpoint appears in that list.
- `/hosting/deploy` says "only static-web file types are accepted (html/css/js/images/fonts/…); server-executable types are rejected". neither doc mentions `.htaccess`, `_headers`, or a header config UI.

measured by me on this domain, 2026-10-27, reproducible with the curl block below:

- `/style.css` and `/img/icon/refresh.svg` each return **two** `cache-control` headers: `max-age=2592000` and `public, max-age=2592000`. 2592000s = 30 days exactly.
- `/` and `/pages/components/footer.html` return no `cache-control` at all.
- the 30-day value is nowhere in the docs above — it only exists as an observation.
- "no header control" and "no purge" mean **no documented way**, not impossible. absence of docs is the entire basis, so treat both as open questions, not vendor limits.

## Caching

Each url has a version query, nothing served warm, like `?v=206910264200.d0a599bc533426f17785217bdb2be3a801a613c4` made from our `.githooks`.

| endpoint | cache-control | x-cache |
| --- | --- | --- |
| `/` | none | REVALIDATED |
| `/index.html`, `/pages/home.html` | none | MISS |
| `/style.css`, `/src/script.js` | `max-age=2592000` + `public, max-age=2592000` | MISS |
| `/img/icon/discord.svg` | same 30-day pair | MISS |

- split is by file type, not path: `.html` never gets a long `max-age`, `.css`/`.js`/`.svg` always do.
- per-page js moved to `/pages/src/` and `/pages/components/src/`; same `.js` rule expected, re-measure after the next deploy.
- 30 days with no `must-revalidate`, so a returning browser never re-asks for a changed asset until it expires.
- every response has `etag` + `last-modified`, so html is revalidated and fresh deploys show up fast.
- **the query string is part of the edge cache key**: a new `?v=` gives `MISS`, then `HIT` for that url alone. this is what makes `?v=` work here. some CDNs ignore query strings and this scheme silently does nothing.

## Verify cache

```sh
curl -sS -D- -o /dev/null "https://xudev.greg.uno/style.css?v=$(date +%s)" | grep -i 'cache-control\|x-cache'
curl -sS https://xudev.greg.uno/pages/src/calendar.js | grep -o 'img/[a-z/.]*discord[a-z.]*' | sort -u
```

then hard reload: stamped requests carry `?v=`, no 404s, calendar Discord buttons point at `https://discord.com/invite/eRzNTw6hFm`.

## Gotchas

- stale cached js can 404 a file that no longer exists. on 2026-10-26 `img/discord.svg` 404d while `img/icon/discord.svg` was live: an old deployed `calendar.js` still asked for the pre-move path.
- relative asset paths (`../img/...`) are deliberate; root-absolute `/img/...` breaks subpath deploys.

## Sources

- [Porkbun API v3 hosting](https://porkbun.com/llms/hosting)
- [connect Static Hosting to Github](https://kb.porkbun.com/article/145-how-to-connect-static-hosting-to-github)
- [set up Static Hosting](https://kb.porkbun.com/article/137-how-to-set-up-static-hosting)
- [FTP upload](https://kb.porkbun.com/article/238-how-to-connect-to-porkbuns-static-hosting-with-an-ftp-client-like-filezilla)
- [version static assets](https://www.cdnworld.com/guide/version-static-assets)
- [Love your cache](https://web.dev/articles/love-your-cache)
- [Cache-Control (MDN)](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Cache-Control)
