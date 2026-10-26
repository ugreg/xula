# Deploy

- Porkbun Secure Static Hosting: CNAME to `ss1-sixie.porkbun.com`, `server: openresty`, `x-service: pixie-sh`.
- files arrive by **GitHub Connect**, which copies the chosen branch verbatim, no purge endpoint. [connect guide](https://kb.porkbun.com/article/145-how-to-connect-static-hosting-to-github)
- so anything live must be committed here, including the build version stamps.

## Cache (measured on the live domain)

each url was probed with a unique query so nothing is served warm. the real stamp format is `?v=<UTC yyyymmddHHMM>.<commit sha>`, e.g. `?v=202610262103.d0a599bc533426f17785217bdb2be3a801a613c4`:

| endpoint | cache-control | x-cache |
| --- | --- | --- |
| `/` | none | REVALIDATED |
| `/index.html`, `/pages/home.html` | none | MISS |
| `/style.css`, `/src/script.js`, `/src/calendar.js` | `max-age=2592000` + `public, max-age=2592000` | MISS |
| `/img/icon/discord.svg` | same 30-day pair | MISS |

- split is by file type, not path: `.html` never gets a long `max-age`, `.css`/`.js`/`.svg` always do.
- 30 days with no `must-revalidate`, so a returning browser never re-asks for a changed asset until it expires.
- every response has `etag` + `last-modified`, so html is revalidated and fresh deploys show up fast.
- **the query string is part of the edge cache key**: a new `?v=` gives `MISS`, then `HIT` for that url alone. this is what makes `?v=` work here. some CDNs ignore query strings and this scheme silently does nothing.

## Sourcing of that claim

"Porkbun hard-codes 30-day `max-age` and gives no header control" is not from a Porkbun doc.

- the 30-day value: measured by me on this domain, not documented anywhere in the [static hosting KB](https://kb.porkbun.com/article/137-how-to-set-up-static-hosting).
- per-file header control (`.htaccess`, `_headers`, config, dashboard toggle): not found.
- purge/invalidation: not found. the static hosting API is only `deploy`, `files`, `makeDir`, `deleteFile` (+ `plans`/`create`/`get`/`delete`) — [API reference](https://porkbun.com/llms/hosting). accurate phrasing is "no documented way", not "impossible".
- a [third-party guide](https://windiweb.design/resources/getting-started-on-porkbun-static-hosting/) claims a "~1 hour" cache and suggests `?cb=`. right trick, wrong number, unofficial.

if Porkbun ever ships header or purge control, this file is stale. the URL is the fallback lever either way.

## Build version
- we use `.githooks`.

## Verify

```sh
curl -sS -D- -o /dev/null "https://xudev.greg.uno/style.css?v=$(date +%s)" | grep -i 'cache-control\|x-cache'
curl -sS https://xudev.greg.uno/src/calendar.js | grep -o 'img/[a-z/.]*discord[a-z.]*' | sort -u
```

then hard reload: stamped requests carry `?v=`, no 404s, calendar Discord buttons point at `https://discord.com/invite/eRzNTw6hFm`.

## Gotchas

- stale cached js can 404 a file that no longer exists. on 2026-10-26 `img/discord.svg` 404d while `img/icon/discord.svg` was live: an old deployed `calendar.js` still asked for the pre-move path.
- relative asset paths (`../img/...`) are deliberate; root-absolute `/img/...` breaks subpath deploys.
- image urls are stamped too, so an in-place `.svg` edit still reaches returning visitors. only `img/` paths are stamped; remote urls and `data:` uris are left alone.
- no purge button exists. a bad deploy is fixed with a new commit and a new build version.

## Sources

- [Porkbun API v3 hosting](https://porkbun.com/llms/hosting)
- [connect Static Hosting to Github](https://kb.porkbun.com/article/145-how-to-connect-static-hosting-to-github)
- [set up Static Hosting](https://kb.porkbun.com/article/137-how-to-set-up-static-hosting)
- [FTP upload](https://kb.porkbun.com/article/238-how-to-connect-to-porkbuns-static-hosting-with-an-ftp-client-like-filezilla)
- [version static assets](https://www.cdnworld.com/guide/version-static-assets)
- [Love your cache](https://web.dev/articles/love-your-cache)
- [Cache-Control (MDN)](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Cache-Control)
