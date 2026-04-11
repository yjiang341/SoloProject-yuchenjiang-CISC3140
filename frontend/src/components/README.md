# Components

All React UI components.

## Structure

```
components/
├── ui/             # shadcn/ui base components
│   ├── button.tsx
│   ├── card.tsx
│   ├── input.tsx
│   ├── progress.tsx
│   ├── dialog.tsx
│   └── ...         # ~40+ shadcn components
│
├── game/           # Components used by the authenticated GamePage
│   ├── game-sidebar.jsx
│   ├── event-panel.jsx
│   ├── combat-panel.jsx
│   └── inventory-panel.jsx
│
├── guest/          # Self-contained guest mode pages
│   ├── create/
│   │   └── page.jsx    # Guest character creation wizard
│   └── play/
│       └── page.jsx    # Guest gameplay
│
└── theme-provider.tsx  # (Legacy — not currently used)
```

## `ui/` — shadcn/ui Components

Pre-built, customizable components from [shadcn/ui](https://ui.shadcn.com/). These are `.tsx` files that use Tailwind CSS and the theme CSS variables defined in `globals.css`. They are imported by both game and guest components.

Common ones: `Button`, `Card`, `Input`, `Label`, `Progress`, `Dialog`, `Select`, `Tabs`, `Badge`.

## `game/` — Authenticated Game Components

Used by `GamePage.jsx`. These components call the backend API through `@/lib/api.js` and `@/lib/game-mechanics.js`.

See [game/README.md](game/README.md) for details.

## `guest/` — Guest Mode Pages

Fully self-contained pages that use `localStorage` and local utilities (`@/lib/guest-config.js`, `@/lib/guest-utils.js`) with no backend dependency.

See [guest/README.md](guest/README.md) for details.

## Theme

All components use a dark gothic fantasy theme via CSS custom variables:

| Variable         | Color               | Usage                |
|------------------|---------------------|----------------------|
| `--primary`      | Crimson red         | Headings, accents    |
| `--accent`       | Gold                | Rewards, gold count  |
| `--destructive`  | Blood red           | Damage, danger       |
| `--secondary`    | Muted purple        | Backgrounds          |
| `--muted`        | Dark gray           | Disabled/secondary   |
