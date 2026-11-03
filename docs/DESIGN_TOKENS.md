# Design tokens

QResto keeps its shared visual values in [`src/app/design-system.css`](../src/app/design-system.css), imported by the single global entry point, `src/app/globals.css`. Use the semantic token names in components; do not introduce new literal colors or pixel sizes in UI code.

## Naming

| Category | Naming | Examples |
|---|---|---|
| Brand and surfaces | `brand`, `surface`, `ink` | `bg-brand`, `text-ink`, `bg-surface-warm` |
| Feedback and status | `positive`, `negative`, `warning`, `info`, `status-*` | `text-positive-700`, `bg-status-pending` |
| Typography | `font-sans`, `text-*`, `font-*`, `leading-*`, `tracking-*` | `font-sans`, `text-sm`, `font-semibold` |
| Spacing | Tailwind spacing utilities backed by the shared `--spacing` unit | `gap-4`, `px-6`, `mt-2` |
| Shape and effects | `rounded-*`, `shadow-*` | `rounded-card`, `shadow-soft` |
| Layout and interaction | `container-*`, `z-*`, `size-touch` | `max-w-content`, `z-modal`, `h-touch` |
| Motion | `duration-*`, `ease-*` and `animate-*` | `duration-normal`, `ease-standard`, `animate-spin-slow` |

Color palette aliases retain the existing Tailwind color values while providing semantic utility names. For example, `stone-*` is available as `ink-*`, `amber-*` as `brand-*`, and the feedback palettes as `positive-*`, `negative-*`, and `info-*`. Use the semantic name in application markup rather than the original palette name.

## Rules

- Never put a CSS color value or pixel length directly in a component. Use a design token; sizes use `rem`.
- The only CSS pixel-size exception is a one-pixel fine border. Media-query breakpoints may use their documented CSS syntax.
- Keep literal values only at non-CSS serialization boundaries that require them (for example QR image colors, the browser color picker, and the static browser theme-color metadata); visual UI styling must still read from design tokens.
- Restaurant-specific brand colors are runtime values and continue to be applied through the restaurant CSS variables after server-side validation.
- `no-hardcoded-css-values` reports hex colors and `px` lengths in JSX class strings, inline style objects, and SVG color attributes.

## Examples

```tsx
<section className="bg-surface-warm text-ink">
  <button className="rounded-card bg-brand px-4 py-3 text-paper-white shadow-soft">
    Commander
  </button>
</section>
```

For dynamic visual values, use the CSS variable rather than constructing a literal:

```tsx
<div style={{ backgroundColor: 'var(--restaurant-primary-color)' }} />
```
