# wieczorem

calm, natural ui components. grayscale by default, monospaced, spring-pressed,
lowcase. built for react first, vue next, structured so svelte can join later
without rework.

## install

```sh
pnpm add @wieczorem/react @wieczorem/styles react react-dom
```

wire the styles once, then use any component:

```tsx
import "@wieczorem/styles";
import { Button, Segmented } from "@wieczorem/react";

<Segmented
  aria-label="view"
  options={[{ value: "editor", label: "editor" }, { value: "recs", label: "recs" }]}
/>
```

dark mode is a toggle, never a media query — set it on the root:

```tsx
document.documentElement.setAttribute("data-theme", dark ? "dark" : "light");
```

## components

actions — `Button` (outline/primary/ghost/danger, sm/md/lg, pill/icon),
`ToggleButton` (latched key), `CopyButton`, `ButtonGroup` (joined),
`Dropzone` (dashed/solid, custom success animation).

inputs — `Input` (label/description/error, prefix/suffix, sm/md/lg, any native
type), `DateInput` (native picker behind one quiet button), `Switch`
(stretch knob), `Checkbox` (fill + counter-dot, indeterminate bar),
`Radio`/`RadioGroup` (horizontal/vertical, descriptions, card variant),
`Otp` (joined cells), `Slider` (single/range, ruler, ink fill),
`Combobox`/`ComboboxMulti` (filter list, chips, groups, custom rows,
chevron, clear-on-pick), `Select`, `MultiSelect` (chips, stays open).

choosers — `Dropdown` (+ `DropdownRoot`/`Trigger`/`Menu` for custom wiring,
chevron optional), `ContextMenu`, `CommandMenu` (⌘K palette, groups,
keybind hints).

navigation — `SidebarProvider` + `Sidebar`/`Header`/`Content`/`Group`/
`Menu`/`Trigger`/`Rail`/`Workspace` (icon/offcanvas collapse, ctrl+b),
`Breadcrumbs`, `Pagination` parts + `SmartPagination` default,
`Tabs`-by-`Segmented` (one rail, one gliding highlight),
`Tree` (guides, arrows + enter), `Collapsible`.

feedback — `Modal` (mirrored exit, optional blur), `ConfirmDialog`,
`Drawer` (any edge, grab handle, adjustable blur), `Tooltip`,
`Callout` (default/success/warning/danger), `Badge`, `ProgressBar`
(label row, indeterminate patrol), `Spinner`, `Skeleton`.

data — `Table`/`THead`/`TBody`/`TR`/`TH`/`TD` (numeric columns, sunken
picks), `Heatmap`.

every component is controlled-or-uncontrolled, keyboard-wired, and honors
`prefers-reduced-motion`.

## styling

every visual decision is a css custom property. retheme the colorscheme
or any element detail without touching the components:

```css
:root {
  --mut-ink: #3a5a40;   /* colorscheme */
  --mut-r-sm: 3px;      /* element detail */
  --mut-switch-stretch: 5px;
}
```

the `mut-` class/token prefix is the stable styling api — it stays put
across renames so overrides never break. per-component tokens live on
their block (`.mut-switch`, `.mut-slider`, …); globals in `tokens.css`.

motion vocabulary, kept frozen: `fast 120ms press` for hovers,
`med 220ms spring` for latches and glides, `rise-in`/`rise-out` for
panels and menus. entrances never spring; exits always mirror.

## layout

```
packages/
  styles/   @wieczorem/styles   css tokens + component styles (the single source of truth)
  react/    @wieczorem/react    react components
  vue/      @wieczorem/vue      vue components (placeholder for now)
site/                          component showcase (vite), dot grid, dark mode
.agents/skills/mut-design/     design principles used across every component
```

## developing

```sh
pnpm install
pnpm dev      # runs the showcase site
pnpm build    # builds all packages
pnpm -r typecheck
```

## releasing

```sh
# bump versions in packages/*/package.json, then:
pnpm build
pnpm --filter @wieczorem/styles publish --access public
pnpm --filter @wieczorem/react publish --access public
```

styles first — react resolves it from the registry at install time.
`prepublishOnly` rebuilds, so a plain `pnpm publish` is safe too.

## design values

see `.agents/skills/mut-design/SKILL.md` — in short:

- calm over loud: grayscale first, color only when it means something
- natural interactions: elements feel physical — buttons compress and rise
  back with a spring, not a fade
- monospaced type by default
- smart rounding: radius scales with component size, never fixed
- minimalist: few borders, few shadows, everything earns its place
- lowercase everywhere, including code and docs
