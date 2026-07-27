# Styling & Responsive Design System

This is the single reference for how Ịmụ-Asụsụ looks and how it adapts across
screens. Every token below is defined once in `src/styles/index.css` (`@theme`) and
consumed through Tailwind utility classes, mostly via `tailwind-styled-components`
(`tw`). Change a value here and it changes everywhere.

**Design language:** warm, paper-like, editorial. Low contrast, one text colour
graded by opacity, outlines instead of shadows, a single orange accent. Serif
(Playfair) for headings and prose; sans (Lato) for UI.

---

## 1. Breakpoints & screen conventions

We use Tailwind's default, mobile-first breakpoints. Styles are written for the
phone first; `sm:`/`md:`/`lg:`/`xl:` prefixes layer on the larger layouts.

| Prefix | Min width | Represents            | What changes at this width |
|--------|-----------|-----------------------|----------------------------|
| _base_ | 0px       | Phone (portrait)      | Single column; sidebar is an off-canvas drawer; tightest gutters |
| `sm`   | 640px     | Large phone / tablet  | 2-column card grids; wider gutters; stat panels relax |
| `md`   | 768px     | Tablet / small laptop | **Sidebar docks** into its own column; the desktop shell begins |
| `lg`   | 1024px    | Laptop                | Full desktop gutter (`px-10`); some grids go to 3–4 columns |
| `xl`   | 1280px    | Desktop               | Card grids reach their max column count (3) |
| `2xl`  | 1536px    | Large desktop         | (unused; layouts are already at max) |

**The one structural breakpoint to remember is `md` (768px)** — it is where the
app stops being a single stacked column and becomes the two-pane desktop shell.

### Layout conventions

- **Page gutters (content padding):** `px-4 sm:px-6 lg:px-10`
  → 16px on phones, 24px on tablets, 40px on desktop.
- **Card grids:** `grid-cols-1 sm:grid-cols-2 xl:grid-cols-3`
  (Notes goes to `xl:grid-cols-4`). Never a fixed multi-column grid on mobile.
- **Sidebar:** off-canvas drawer (`w-64`, slides in over a dimmed backdrop) below
  `md`; docked 16rem column at `md`+, collapsible to a 4rem rail. The collapse/rail
  is a desktop-only affordance — on a phone the drawer is simply open or shut.
- **Drawers & side panels** (manuscript details, generate, entry, reader):
  `w-full max-w-md|max-w-2xl|w-[26rem]` — they fill the screen on a phone and cap
  their width on desktop.
- **Wide content** (the timeline graph): lives inside an `overflow-x-auto`
  scroller so it never forces the page to scroll sideways.
- **Vertical rhythm:** sections use `mb-8 sm:mb-10` or `mb-12`; the tightest
  usable gutter is never below 16px.

---

## 2. Colour

The whole palette is four custom tokens plus a few semantic Tailwind built-ins.
There is deliberately **one text colour**; hierarchy comes from `opacity`, not
from more colours.

| Token / class            | Hex       | Role |
|--------------------------|-----------|------|
| `text-title`             | `#63614f` | The only text colour. Warm charcoal-olive. |
| `bg-orange-accent`       | `#fdba74` | Primary accent — CTAs, focus rings, hover borders, active states. |
| `bg-orange-background-100`| `#fff4e6`| Warm surface tint — sidebar, chips, stat panels, notices, hover fills. |
| `border-grey-info-outline`| `#ced4da`| Every card / input / divider border. |
| `text-white` on `bg-title`| `#ffffff`| Text on the dark solid buttons (Sign in, primary actions). |

**Semantic built-ins in use:** `orange-300` (= `#fdba74`, the accent, used on
hover borders), `black/5` · `black/10` · `black/30` (hover fills and drawer
backdrops), `red-500` / `red-600` (form and action errors only).

**Opacity ladder for text hierarchy** (all on `text-title`):

| Opacity | Use |
|---------|-----|
| 100%    | Headings, primary content |
| 70%     | Subtitles, active-but-secondary nav |
| 60%     | Body descriptions, hints |
| 50%     | Muted meta, back links |
| 40%     | Faint labels, counts, uppercase eyebrows |
| 25%     | Disabled nav items |

> **Design rule:** reach for opacity before reaching for a new colour, and an
> outline before a shadow.

---

## 3. Typography

Two families, loaded from Google Fonts:

| Family              | Class          | Weights (loaded) | Used for |
|---------------------|----------------|------------------|----------|
| **Playfair Display**| `font-heading` | 400 · 600 · 700 (+ italic 400) | `h1`–`h3`, prose `<p>`, numbers in stat panels |
| **Lato**            | `font-body`    | 300 · 400 · 700 (+ italics)    | All UI text — nav, buttons, inputs, labels, cards |

**Base rules** (`@layer base`):
- `body` → Lato, `#63614f`.
- `h1, h2, h3` → Playfair.
- `<p>` → Playfair **italic**, `line-height: 1.7` — long-form prose reads as an
  editorial page. (UI paragraphs opt back out with `font-body not-italic`.)

### 3.1 Fluid display scale (headings)

The large sizes are **fluid**: each is a `clamp(min, preferred, max)` that scales
smoothly with the viewport between ~360px and ~1280px. This is why every heading
in the app is responsive **without a single per-component breakpoint** — the size
lives in the token. The **max equals the old fixed value**, so the desktop look is
unchanged; only smaller screens shrink.

| Token       | Mobile (≤360px) | Desktop (≥1280px) | Line-height | Where it's used |
|-------------|-----------------|-------------------|-------------|-----------------|
| `text-6xl`  | **40px**        | **60px**          | 1.05        | Welcome hero title |
| `text-5xl`  | **32px**        | **48px**          | 1.10        | Place / People page `h1` |
| `text-4xl`  | **28px**        | **36px**          | 1.15        | Home & Explore `h1`; stat numbers |
| `text-3xl`  | **24px**        | **30px**          | 1.20        | Manuscripts, Timeline, Collaborate, Notes `h1` |
| `text-2xl`  | **20px**        | **24px**          | 1.25        | Section titles ("Your Interests", "Places") |

**Read it plainly:**
- On **desktop**, the marketing hero title is **60px**, an entity page title
  (a place or people) is **48px**, a hub/library page title is **36px** (Home,
  Explore) or **30px** (Manuscripts, Notes…), and section headings are **24px**.
- On a **phone**, those same headings become **40 / 32 / 28 / 24 / 20px** — smaller,
  never overflowing, and interpolating fluidly in between.

### 3.2 Fixed UI scale (everything else)

These are Tailwind's defaults and **do not scale** — UI labels and body copy
should read the same size on every device.

| Class       | Size  | Used for |
|-------------|-------|----------|
| `text-xl`   | 20px  | Collaborate section titles |
| `text-lg`   | 18px  | Brand name in sidebar |
| `text-base` | 16px  | Page subtitles, entity descriptions |
| `text-sm`   | 14px  | **The UI default** — nav, buttons, inputs, card titles, most body |
| `text-xs`   | 12px  | Labels, counts, meta, uppercase eyebrows |
| `text-[13px]` | 13px | Timeline card titles |
| `text-[11px]` / `text-[10px]` | 11 / 10px | Micro-labels, tags, associations (sparingly) |

**Prose paragraph** (`.hero-block p`): fluid `clamp(17px → 20px)`, Playfair italic,
line-height 1.7.

**Font styles in play:** `font-bold` (700) for headings and emphasis, `font-semibold`
(600) for buttons/active nav, `font-medium` (500) for nav/card titles, `italic` for
prose and subtitles, `uppercase tracking-widest`/`tracking-wide` for eyebrow labels.

---

## 4. Border radius

Tailwind's default radius scale; four steps in regular use.

| Class          | Radius | Used for |
|----------------|--------|----------|
| `rounded-md`   | 6px    | Editor toolbar buttons, floating notes |
| `rounded-lg`   | 8px    | Buttons, inputs, nav items, chips, sidebar search |
| `rounded-xl`   | 12px   | **Cards**, search boxes, primary CTAs, popovers, notices |
| `rounded-2xl`  | 16px   | Stat panels, onboarding card, `.hero-block`, timeline bottom sheet |
| `rounded-full` | ∞      | Pills, icon buttons, remove/dismiss buttons, the hero glow |

Cards default to `rounded-xl` + a `border-grey-info-outline` outline (no shadow).

---

## 5. How responsiveness is implemented (the "optimal" bit)

The goal was maximum responsive coverage for minimum, maintainable change:

1. **Fluid type tokens** (`src/styles/index.css`) make ~every heading responsive at the
   token level — no `text-3xl sm:text-4xl lg:text-5xl` sprinkled across 15 pages.
   One edit changes the whole scale.
2. **A single structural breakpoint (`md`)** flips the shell between a stacked
   mobile layout and the docked desktop layout, driven by `useMediaQuery` +
   Tailwind `md:` classes in `AppLayout` / `Dashboard`.
3. **Mobile-first utilities** everywhere else: grids start at one column and add
   columns up; gutters start at 16px and grow; side panels are `w-full` and cap
   with `max-w-*`.
4. **Overflow is contained, never leaked**: wide visualisations scroll inside
   their own box so the page body never scrolls horizontally.

### Known focused exception
The manuscript **editor** runs in "bleed" mode (no top bar, owns the full content
cell) for distraction-free writing, so it has no hamburger. Reach the editor from
the Manuscripts library (which has the menu), and use the tab bar's close to
return. This is intentional, not a gap.

---

_Tokens live in `src/styles/index.css`. When you add a colour, size, or radius, add it
there and document it here in the same change._
