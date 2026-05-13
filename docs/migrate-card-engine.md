# Migrating Card Games to the `<Card>` Engine

This recipe documents how to replace hand-rolled playing-card markup
(usually `<div className="...card">{rank}{suit}</div>` with a per-game
`cardName()` / `isRed()` helper) with the shared deck engine component
at `web/src/engines/deck/Card.tsx`.

A first batch of **26 representative games** was migrated as a proof of
pattern. Follow this recipe for the rest.

---

## 1. The `<Card>` API

```ts
import { Card } from "../../engines/deck/Card.js";
import type { Card as EngineCard, Suit, Rank } from "../../engines/deck/index.js";

interface Props {
  card?: EngineCard;                 // omit (or pass faceDown) for the back
  faceDown?: boolean;                // renders the shared back design
  onClick?: () => void;              // click-vs-drag-tolerant
  draggable?: boolean;
  onDragStart?: (e: React.DragEvent) => void;
  onDragEnd?: (e: React.DragEvent) => void;
  className?: string;                // appended after `card face-up <red|black>` / `card face-down`
  style?: React.CSSProperties;       // used for per-card CSS vars (e.g. `--card-stagger-delay`)
}
```

`EngineCard` is:

```ts
type Suit = "♠" | "♥" | "♦" | "♣";
type Rank = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13; // 1 = Ace, 11 = J, 12 = Q, 13 = K
interface Card { suit: Suit; rank: Rank; id: string }
```

The component renders a `<div>` with the rank in two corners, a centred
suit, and a coloured `red`/`black` class. It manages `aria-label` for
SR users and uses pointer-event click detection so `draggable` does not
swallow clicks.

CSS classes the engine still respects (legacy hooks):
`.card`, `.face-up`, `.face-down`, `.red`, `.black`, `.corner`,
`.center-suit`.

---

## 2. Hand-rolled patterns to replace

Three encodings dominate the codebase. Each maps to a single `<Card>`
usage via a tiny inline adapter.

| Pattern (before) | Migration (after) |
| --- | --- |
| `c: number` with `cardName(c)`, ranks `["2","3",…,"K","A"]` (index 12 = A) | `<Card card={toEngineCard(c)} className="..." />` using **adapter A** below |
| `c: number` with ranks `["A","2",…,"K"]` (index 0 = A) | Same call, **adapter B** below |
| `{ suit: "S"\|"H"\|"D"\|"C"; rank: number }` (e.g. `card-shovel`) | **adapter C** — map suit char + cast rank |
| State already imports `Card` from `engines/deck/index.js` (e.g. `dragon-tiger`, `high-low-casino`, `casino-war-multi`, `deuces-wild`) | Just `<Card card={c} ... />` — no adapter |

### Adapter A — `[2,3,…,K,A]` numeric encoding

```ts
const SUITS: Suit[] = ["♠", "♥", "♦", "♣"];
function toEngineCard(c: number): EngineCard {
  const rIdx = c % 13;
  const sIdx = Math.floor(c / 13);
  const rank = (rIdx === 12 ? 1 : rIdx + 2) as Rank; // 12 -> A=1, else +2
  return { suit: SUITS[sIdx]!, rank, id: `prefix-${c}` };
}
```

### Adapter B — `[A,2,…,K]` numeric encoding

```ts
const SUITS: Suit[] = ["♠", "♥", "♦", "♣"];
function toEngineCard(c: number): EngineCard {
  const rIdx = c % 13;
  const sIdx = Math.floor(c / 13) % 4;
  const rank = (rIdx + 1) as Rank;
  return { suit: SUITS[sIdx]!, rank, id: `prefix-${c}` };
}
```

### Adapter C — `{ suit: "S"|"H"|"D"|"C"; rank: 1..13 }`

```ts
const GLYPH: Record<"S"|"H"|"D"|"C", Suit> = { S:"♠", H:"♥", D:"♦", C:"♣" };
const toEngineCard = (c: { suit: "S"|"H"|"D"|"C"; rank: number; id: number }): EngineCard =>
  ({ suit: GLYPH[c.suit], rank: c.rank as Rank, id: `prefix-${c.id}` });
```

> The `id` only needs to be unique within React's render scope. For
> games that re-deal the same `number` index across rounds, include the
> hand position in the id (e.g. `` `aiar-${i}-${c}` ``) so `key` stays
> stable when the deck shuffles.

---

## 3. Migration steps (per file)

1. **Add the imports**

   ```ts
   import { Card } from "../../engines/deck/Card.js";
   import type { Card as EngineCard, Suit, Rank } from "../../engines/deck/index.js";
   ```

2. **Drop the now-unused state imports** (`cardName`, `isRed` — the
   engine handles its own rank label and red/black colour).

3. **Paste the right adapter** (A, B or C from §2) just above the
   component. Skip if state already uses the engine `Card` type.

4. **Replace each card render.** Common JSX shapes:

   | Before | After |
   | --- | --- |
   | `<div className={isRed(c) ? "x-card red" : "x-card black"}>{cardName(c)}</div>` | `<Card card={toEngineCard(c)} className="x-card" />` |
   | `<button className="x-card" onClick={fn}>{cardName(c)}</button>` | `<Card card={toEngineCard(c)} className="x-card" onClick={fn} />` |
   | `<div className="x-card face-down">?</div>` | `<Card faceDown className="x-card" />` |
   | `<div className="x-card placeholder">?</div>` (no card yet) | `<Card faceDown className="x-card placeholder" />` |

5. **Preserve every test id and label.** `data-testid`, `aria-label`,
   and click targets on buttons/anchors next to a card are unaffected.
   If a test specifically targets the card element itself, wrap `<Card>`
   in a `<div data-testid="...">` since the engine exposes no testid prop.

6. **Typecheck.** From `web/`:
   `npx tsc -p tsconfig.json --noEmit`

---

## 4. Props checklist

For every `<Card>` you add, confirm:

- [ ] `card` matches the engine shape (numeric `rank` 1–13, unicode `suit`).
- [ ] Adapter `id` is unique per render (include hand index for shuffled piles).
- [ ] `onClick` reproduces the same dispatch the old `<button>` fired.
- [ ] `faceDown` is used (not an empty placeholder div) when the card is
      hidden — keeps the shared back design and `aria-label="face-down card"`.
- [ ] `draggable` + `onDragStart`/`onDragEnd` wired through if the source
      game supported drag-and-drop.
- [ ] No `<Card>` is nested inside an interactive element with its own
      handler — pass the handler directly to `<Card>` instead.
- [ ] `data-testid` for a specific card (if any test needs it) is on a
      wrapper element.

---

## 5. Common pitfalls / regressions to watch for

- **`exactOptionalPropertyTypes`.** The repo enables this. Passing
  `card={cond ? engineCard : undefined}` raises TS2375. Either branch
  the JSX (`cond ? <Card card={…}/> : <Card faceDown/>`) or build a
  conditional spread:

  ```tsx
  const clickProps = disabled ? {} : { onClick: handler };
  return <Card card={c} {...clickProps} />;
  ```

  This is the same pattern documented for `<Die>`.

- **Rank ordering.** Mis-detecting the local encoding (A-first vs
  A-last) flips every face card. Sanity-check by reading the in-state
  `ranks` literal array before committing to an adapter.

- **Custom themeOverrides.** A game's `.x-card` CSS that sets
  `background`/`border`/`color` on `.x-card` directly will still apply
  because `<Card>` passes `className` through. But CSS that targets the
  inner text node (`.x-card > span`) breaks — the engine renders three
  `.corner` / `.center-suit` children, not a flat text node. Replace
  selectors with `.x-card .rank` / `.x-card .suit` if needed.

- **Drag/drop wiring.** Solitaire-style games that used `onDragStart`
  on a wrapping `<div>` should move it onto `<Card draggable onDragStart=...
  onDragEnd=...>`. The engine intentionally splits click vs drag using
  pointer events; leaving the old wrapper draggable will fire **both**
  the wrapper's drag and the engine's click on the same gesture.

- **Accessibility labels.** The engine emits `aria-label="A of ♠"`
  style. If your game previously set a richer label (`"Ace of Spades,
  in trick pile, your turn"`) put a `role="group" aria-label="..."`
  on a wrapper — do not pass `aria-label` to `<Card>`; the prop is not
  exposed.

- **Wrapping `<button>` removal.** Several games used
  `<button className="…card" onClick=…>{cardName(c)}</button>` for
  clickable cards. Replace with `<Card card={…} onClick={…} />` and
  drop the button. If you must preserve focusable-element semantics
  (keyboard "Enter"/"Space" activation), wrap in a `<div role="button"
  tabIndex={0} onKeyDown=…>` — note the engine itself is a `<div>` and
  is not keyboard-activatable today.

- **`disabled` state.** The engine has no `disabled` prop. To skip the
  click handler, pass it conditionally (spread trick above) and/or add
  a CSS class that styles `pointer-events: none; opacity: .5;`.

- **Pip overlays / annotations.** Some games render a pip-value or
  helper label *inside* the card box (e.g. `card-discard-down` shows
  `(7)` for the pip value). Move the overlay outside the card and use
  a sibling element in a wrapping `<div>` — the engine renders its own
  rank/suit content and will visually clash with extra children.

- **Sentinel `?` placeholders.** Games render `<div className="...
  placeholder">?</div>` before a draw happens. Map these to
  `<Card faceDown className="... placeholder" />` so the shared back
  design and ARIA label are consistent.

---

## 6. Reference: games already migrated

| Game | Encoding | Notes |
| --- | --- | --- |
| `card-color-guess` | A (2..A) | Single card; `Card` vs `faceDown` ternary |
| `red-or-black` | A | Single card with win/lose class |
| `ace-finder` | A | 4 cards as buttons → wrapped in spread-props pattern |
| `card-bid-flip` | A | Single card; bid input preserved |
| `card-bid-streak` | A | Current card + face-down placeholder |
| `card-bakery` | A | Pair display + kept-row |
| `card-call` | A | Single card |
| `all-in-a-row` | B (A..K) | 5-card hand as clickable cards |
| `dragon-tiger` | engine | State already uses `EngineCard`; pure JSX swap |
| `high-low-casino` | engine | Includes face-down placeholder for unknown next |
| `casino-war-multi` | engine | Local `MiniCard` wrapper kept for hand grouping |
| `deuces-wild` | engine | Held-state click-to-hold preserved; wild class kept |
| `double-bonus-poker` | engine | Same as deuces-wild minus the wild class |
| `card-shovel` | C (S/H/D/C) | Map S/H/D/C → unicode |
| `card-bouncer` | A | Pip overlay moved outside `<Card>` |
| `card-canyon` | A | Hand row |
| `card-cascade` | A | Last-card + tail-hand row |
| `card-collect-flush` | A | Hand row |
| `card-clock` | A | Single drawn card |
| `card-clutch` | A | Single card; clutch round badge preserved |
| `card-discard-down` | A | Cards-as-buttons → spread-props + sibling pip label |
| `card-collector` | A | Drawn row with hit-class |
| `card-bookshop` | A | Identical to card-bakery |
| `card-equality` | A | Hand row |
| `aces-up-mini` | A | Single card |
| `blind-hookey` | B | 5-card hand as clickable cards |

---

## 7. Remaining work

The card audit identifies the following candidate buckets among the
~880 hand-rolled card UIs:

- ~30 simple `mini-*` / `card-*` games using **adapter A** with a
  single card or small hand. Mechanical 2-3 min migrations following
  any of the entries in §6.
- ~110 mid-size games (state declares `interface ...State { hand:
  number[] }` and uses `cardName` everywhere) — A or B adapter,
  5-8 min each.
- ~80 solitaire-family games (`klondike`, `forty-thieves`, `freecell`,
  `spider`, `pyramid`, `tri-peaks`, etc.) — many use the shared
  `SolitaireFamilyView` already; the remaining hand-rolled ones will
  need drag/drop wiring carried through. 10-15 min each.
- ~40 casino video-poker / table games — most already import the
  engine `Card` type in state, so the migration is identical to
  `dragon-tiger` / `deuces-wild`. 3-5 min each.
- ~20 games with **custom card models** — string ranks ("A","2",…,"K"),
  uno-style coloured cards, fortune-teller string suits,
  `card-spinner` slot-style decks. **Skip** until the engine grows a
  thinner contract or the game's state is normalised to numeric ranks.
  Examples: `fifteens`, `napoleons-tomb`, `card-spinner`,
  `fortune-teller`, `uno-like`, `tic-tac-toe-cards`.

```
# approximate audit query
grep -rl "playing-card\|cm-card\|sol-card\|card-game-card" \
  web/src/games/*/Game.tsx | xargs grep -L "engines/deck/Card"
# → 280 files at time of writing
```

**Effort estimate**

| Category | Count | Per-game | Total |
| --- | --- | --- | --- |
| Simple numeric encoding (single card / small hand) | ~140 | 2-3 min | 5-7 h |
| Solitaire-family with drag/drop | ~80 | 10-15 min | 13-20 h |
| Casino / video poker (state already engine) | ~40 | 3-5 min | 2-3 h |
| Custom card models (engine extension first) | ~20 | block | needs design |

**Total**: ~20-30 hours of focused mechanical work for the 260
mechanically-migratable files, plus an engine design pass before
touching the ~20 custom-model outliers.

Recommend driving the simple-numeric bucket as one PR (highly
scriptable — same adapter, same JSX pattern, easy to review in bulk),
the solitaire-family bucket as a second PR with screenshot review for
drag/drop regressions, and gating the custom-model cluster behind an
engine RFC that either: (a) widens `Rank` to accept string labels, or
(b) adds a `themeOverrides` prop for non-standard suits/colours.
