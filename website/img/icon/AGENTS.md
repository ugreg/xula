# img/icon/ icons

rules for every svg in this folder

- root tag is always `width="16" height="16"`
- keep the artwork's own `viewBox`. a `0 0 24 24` icon still renders at 16x16, the art just scales
- color with `currentColor` only. never hardcode a hex, themes are handled in css
- no framework classes on the root tag (`lucide*`, `size-*`, `text-*`, `opacity-*`). they do nothing in a standalone file, style with css instead
- keep `aria-hidden="true" focusable="false"` on decorative icons
- kebab-case filename, one icon per file
- display size lives in css when it differs from 16, eg `.calendar-fab img { width: 20px; height: 20px; }`
- reference icons as `img/icon/name.svg` from root pages and `../img/icon/name.svg` from `pages/`
