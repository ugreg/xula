# icons

## required on the root `<svg>`

- `width="16" height="16"`, always. css sizes it at the call site, never bake 24 / 1em / 130 here.
- `xmlns="http://www.w3.org/2000/svg"`.
- `viewBox` copied from the source grid, never rescaled or re-centered: 24 for lucide-derived icons, 16 for our own glyphs, brand logos keep their native grid (`docker.svg` 38x30, `reddit.svg` 256x256, `qwen.svg` 141.38x140).
- `fill="none"` on stroke icons, `fill="currentColor"` on solid ones.

## color

- `currentColor` or `none` only. no hex, rgb(), named colors, `style`, `<style>`, or gradients with baked colors.
- stroke icons put the kit on the root: `stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"`. dense 16-grid glyphs may use `stroke-width="2.5"` (`luna.svg`, `sol.svg`, `monitor.svg`). 16-grid custom glyphs may carry `stroke`/`fill` on the children instead of the root, still `currentColor` only.

## never

- `class`, `id`, `style`, `aria-hidden`, `focusable`, `role`. the file has no styling and no a11y job: `<img alt="" aria-hidden="true">` on the page does both, and a `class` inside an `<img>`-loaded svg can never match any css.
- more than one line, and no missing trailing newline.
- `d` data rewritten to "fit" 16px. scale nothing, crop nothing.

## naming

`kebab-case.svg`, one name per icon, no synonym pairs. if a variant exists, suffix it: `bulb-on.svg` / `bulb-off.svg`, `settings-alt.svg`, `arrow-left.svg` / `arrow-right.svg`.
