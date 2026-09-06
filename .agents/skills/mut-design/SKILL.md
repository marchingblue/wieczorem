---
name: mut-design
description: design principles for the mut/ui component library — use when building or reviewing any mut component, style, or demo. covers tone, tokens, motion, accessibility, and framework conventions.
---

# mut design principles

mut is a component library that should feel **calm, physical, and quiet**.
if a component screams, it is wrong. if it feels like pressing a real
well-made switch, it is right.

## 1. tone

- **lowercase everywhere** — component copy, docs, demo labels, even
  placeholders. no screaming ui, no shouty headings.
- **minimalism** — every border, shadow, and icon must earn its place.
  when in doubt, remove it.
- **calm** — no saturated colors by default, no motion that startles,
  no layout shifts.

## 2. color — grayscale first

- the base palette is **pure grayscale**: near-black ink on near-white
  paper, with a full ramp between.
- color appears **only when it carries meaning**: success, warning,
  danger, or an explicit brand accent. a colored element should be the
  exception the eye notices, not the wallpaper.
- dark mode is not an afterthought: every token has a dark counterpart,
  driven by `[data-theme="dark"]` on the root, never by media query
  alone (users must be able to toggle).

## 3. type — monospaced by default

- default typeface is a **monospace stack**: `ui-monospace, "SF Mono",
  "Cascadia Code", "JetBrains Mono", Menlo, Consolas, monospace`.
- keep sizes in a small step scale; prefer fewer, larger steps.
- lowercase reads calmer — do not use `text-transform: uppercase` for
  labels; if emphasis is needed, use weight or letter-spacing instead.

## 4. smart rounding

- radius **scales with component size**: small controls round less,
  large surfaces round more. never a single fixed radius for everything.
- rule of thumb: `radius = min(8px, height * 0.25)` for controls;
  surfaces use one step above their innermost control.
- fully-round (`999px`) is reserved for pills, toggles, and badges —
  things that are conceptually "capsules". switches do **not** use it:
  their housing is a low-radius rectangle while the knob inside is
  rounder than the housing (outer less rounded, inner more).
- **contrast pairs**: anything that floats on ink (switch knob, slider
  thumb) uses `--mut-elevated` — a token guaranteed to contrast the page
  in both themes. never paint a knob with `--mut-bg` (it *is* the page
  color in dark mode → invisible).
- **padding is not square**: controls are roomier horizontally than
  vertically. `pad-y ≈ 0.6 × pad-x` (e.g. 6/14, 4/10, 9/20). equal
  x/y padding reads bloated and loud.

## 5. motion — natural, springy, subtle

- interactions must feel **physical**: pressed elements compress
  (scale down ~0.97, sink 1px), then **spring back** with a slight
  overshoot on release. like a real key returning.
- springs, not durations: prefer `cubic-bezier(0.34, 1.56, 0.64, 1)`
  (standard back-out overshoot) for release transitions, and a fast
  ease-out (~120ms) for press-down. down is quick, return is springy.
- everything transform/opacity only — never animate layout properties
  (width, top, font-size). reserve width/height animation for drawers
  where unavoidable, and keep it under 250ms.
- **entrance is not a spring.** panels, menus, dialogs, and lists arrive
  with `mut-rise-in`: a fast (~120ms) 4px rise, plain ease-out, **no
  scale step**. scale-in on a bordered panel against a busy page reads
  as a white flash. springs are for release; entrance is arrival.
- latched states (toggles, switches) have **no hover opinion** — the
  fill is the state; hovering a latch must not repaint it.
- amplitude is small: 0.96–1.0 scale, 2–6px translations. nothing
  bounces across the screen.
- respect `prefers-reduced-motion`: springs collapse to plain fades.

## 6. interaction feel (the checklist)

a control "feels mut" when:

- [ ] hover state is visible but quiet (background shift, not glow)
- [ ] active/press compresses the element (scale ~0.97 + sink)
- [ ] release springs back with a hint of overshoot
- [ ] focus-visible shows a clean 2px offset ring, grayscale
- [ ] disabled is clearly inert — reduced contrast, no press effect
- [ ] keyboard works: space/enter activate, tab moves, nothing traps
- [ ] `prefers-reduced-motion` is honored

## 7. archetypes (component grammar)

recurring interaction archetypes, so components stay coherent:

- **the key** (button, toggle button): compresses on press, springs back
  on release. a latched key (toggle) stays slightly sunken while on, and
  does not change on hover while latched.
- **the latch** (switch): one design only. a low-radius rectangular
  track with a knob that is *rounder than its housing*, visible in both
  themes (`--mut-elevated` off, `--mut-bg` on). press nudges the knob
  toward its travel; release springs it across. `role="switch"` +
  `aria-checked`.
- **the fill, not the mark** (checkbox, future radio): a checked box
  fills with ink and answers with a small counter-dot — no drawn
  checkmark. indeterminate fills with a short bar. state changes are
  fills and fades, never strokes being traced.
- **the glide** (segmented, tabs, breadcrumbs-as-rail): one quiet rail,
  one highlight that **slides** between options with the spring — never
  fade-out/fade-in, the highlight travels. measure in js, move with
  transform.
- **the chooser** (select, combobox): a closed trigger that opens the
  shared quiet list (`mut-menu`). picking closes immediately (single
  mode), the chosen value **replaces the titlebar text** (the placeholder
  never lingers as the title), and the chosen row answers with a small
  square dot **at the end of the row**. multi mode keeps the list open,
  grows chips with quiet × buttons, and chips are draggable to reorder.
  dropdowns can omit the chevron entirely — a bare button that summons
  the menu.
- **the interruption** (dialog, drawer): overlay fades fast, panel
  arrives with `mut-rise-in` — no scale, no overshoot — and **exit
  mirrors entrance** exactly (`data-closing` + the matching `-out`
  keyframes; `useExit` drives it). escape and overlay-click dismiss;
  focus lands inside and returns where it came from. a drawer slides
  from any edge over still content; optional handle bar (sheets) and
  frosted overlay (`blur`).
- **the draw-in mark** (copy check): small strokes draw themselves in
  (`pathLength=1` + dashoffset), fast — sub-300ms, matched by a short
  reset. reserved for confirmations, not for state fills.
- **the fader** (slider): the thumb is a **rounded square with a
  circular dot** in its center — never a bare circle, never a wide box.
  fill is ink on a faint rail; optional step ruler marks the allowed
  intervals.
- **the breath** (skeleton): placeholders are a soft wash that slowly
  breathes. no shimmer sweeps, no spinners.
- **opaque controls**: every control surface (buttons, inputs, cells,
  chips, slider thumbs, trigger rows) is painted with `--mut-bg` — a
  page backdrop like the dot grid must never bleed through a control.
  washes made with `color-mix(…, transparent)` are only for hover/latch
  fills, never for the resting surface of a control.
- groups (button group, segmented, otp): one border between neighbors,
  outer corners keep the smart rounding, the group reads as a single
  object. otp cells are just a joined group of inputs.

## 8. customization contract

- every visual decision is exposed as a **css custom property** with a
  sensible default: `--mut-btn-radius`, `--mut-btn-bg`, etc.
- users theme by overriding **tokens** (`--mut-bg`, `--mut-ink`,
  `--mut-accent`), not by fighting selectors.
- class names follow `mut-<component>` (block) and `mut-<component>__<part>`
  or `is-<state>` modifiers — bem-lite, no nesting wars.
- components never inject inline styles for things tokens can express.

## 9. engineering conventions

- react is the reference implementation; vue mirrors its api 1:1
  (same prop names, same class hooks, same tokens).
- css lives only in `@mut/styles` — components import class hooks,
  never their own styles.
- one css file per component: `button.css`, `toggle-button.css`, …
- each component ships: the component, a keyboard story, a demo entry
  on the site, and a token sheet (which vars it reads).
- types are strict; no `any` in public props.
