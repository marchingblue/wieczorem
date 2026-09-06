# mut/ui

calm, natural ui components. grayscale by default, monospaced, spring-pressed,
lowcase. built for react first, vue next, structured so svelte can join later
without rework.

## layout

```
packages/
  styles/   @mut/styles   css tokens + component styles (the single source of truth)
  react/    @mut/react    react components
  vue/      @mut/vue      vue components (placeholder for now)
site/                    component showcase (vite), dot grid, dark mode
.agents/skills/mut-design/  design principles used across every component
```

## developing

```sh
pnpm install
pnpm dev      # runs the showcase site
pnpm build    # builds all packages
```

## design values

see `.agents/skills/mut-design/SKILL.md` — in short:

- calm over loud: grayscale first, color only when it means something
- natural interactions: elements feel physical — buttons compress and rise
  back with a spring, not a fade
- monospaced type by default
- smart rounding: radius scales with component size, never fixed
- minimalist: few borders, few shadows, everything earns its place
- lowercase everywhere, including code and docs
