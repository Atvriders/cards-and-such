# Migrating Dice Games to the `<Die>` Engine

This recipe documents how to replace hand-rolled die markup (Unicode glyphs
`⚀⚁⚂⚃⚄⚅`, custom SVG, or CSS `.die` boxes) with the shared dice engine
component at `web/src/engines/dice/Die.tsx`.

A first batch of 14 representative games was migrated as a proof of pattern.
Follow this recipe for the rest.

---

## 1. The `<Die>` API

```ts
import { Die } from "../../engines/dice/Die.js";

interface Props {
  value: 1 | 2 | 3 | 4 | 5 | 6;
  kept?: boolean;     // golden "kept" face, lifted shadow
  rolling?: boolean;  // tumble animation
  onClick?: () => void; // makes the die interactive
}
```

The component renders a `<button>` with an SVG die face, pip layout, kept-state
amber face, and built-in `:hover`/`:active`/`:focus-visible`/`prefers-reduced-motion`
styling. It already manages `aria-label` and `aria-pressed`.

CSS classes the engine still respects (legacy hooks):
`.die`, `.die.kept`, `.die.rolling`, `.die.dice-roll`.

## 2. Hand-rolled patterns to replace

The codebase has three common hand-rolled patterns. Each maps to a single
`<Die>` usage:

| Pattern (before) | Migration (after) |
| --- | --- |
| `const FACES = ["", "⚀","⚁","⚂","⚃","⚄","⚅"];` then `<span>{FACES[d]}</span>` | Remove the const. `<Die value={d as 1 \| 2 \| 3 \| 4 \| 5 \| 6} />` |
| `const PIPS = [...]; <span className="die">{PIPS[d]}</span>` | Same — `<Die value={...} />` replaces both the const and the wrapper |
| `<button className="die kept" onClick={...}>{FACES[d]}</button>` (toggle-keep) | `<Die value={d as 1\|...\|6} kept={kept[i]} onClick={...} />` |

## 3. Migration steps (per file)

1. **Add the import**

   ```ts
   import { Die } from "../../engines/dice/Die.js";
   ```

2. **Delete the FACES/PIPS const.** It is now dead code.

3. **Replace each die render** with `<Die ... />`. The data flow is:

   - `value`: the numeric die face from state. Cast as
     `d as 1 | 2 | 3 | 4 | 5 | 6` since most state types use `number`.
   - `kept`: pass `state.kept[i]` (or whatever the boolean is). Coerce with
     `!!state.kept[i]` when the array may be `(boolean | undefined)[]`.
   - `onClick`: wire the existing dispatch (e.g.
     `() => dispatch({ type: "toggle", index: i })`). The engine renders a
     `<button>`, so it is keyboard-accessible by default.
   - `rolling`: pass `true` while the roll animation should play.

4. **Preserve test ids and other handlers.** `data-testid` attributes on the
   Roll/Bank/Score buttons (not on the die) are unaffected. If a test
   specifically targets the die element, keep a wrapping `<span>` /
   `<div>` and put the `data-testid` there.

5. **Typecheck.** From `web/`:
   `NODE_OPTIONS=--max-old-space-size=8192 npx tsc -p tsconfig.json --noEmit`
   (the heap bump is required — default 4 GB OOMs on this codebase).

## 4. Props checklist

For every `<Die>` you add, confirm:

- [ ] `value` cast to the literal union `1 | 2 | 3 | 4 | 5 | 6`.
- [ ] `kept` reflects the same boolean the old `.kept` class encoded.
- [ ] `onClick` reproduces the same dispatch the old `<button>` fired.
- [ ] No die is rendered inside another `<button>` (the engine *is* a
  `<button>`; nesting is invalid HTML).
- [ ] `data-testid` for the die (if used) is on a wrapper element.

## 5. Common pitfalls

- **`exactOptionalPropertyTypes`.** The repo enables this. Passing
  `onClick={disabled ? undefined : handler}` raises TS2375. Use a spread
  instead:

  ```tsx
  const clickProps = disabled ? {} : { onClick: handler };
  return <Die value={d as 1|2|3|4|5|6} {...clickProps} />;
  ```

  The same trap applies to `kept` and `rolling` if the source value is
  `boolean | undefined` — coerce with `!!` or use the spread.

- **Custom die faces beyond 1–6.** A handful of games (poker dice, custom
  Wimpout faces) render letters or icons rather than pips. The engine only
  supports 1–6; **skip these** or extend the engine first. Examples found
  during the audit: `cosmic-wimpout`, `poker-dice-variant` (any game whose
  state stores `string` faces or values outside 1–6).

- **Multi-die scoring layouts.** Yahtzee-style games already use `<Die>` —
  see `farkle-mini`, `mini-tenzi`, `boss-dice`, `generala`, `balut`,
  `straight-or-bust` for reference patterns (especially for kept-toggle
  wiring with `toggleKeep` from `engines/dice/index.ts`).

- **Don't nest `<Die>` inside a `<button>`.** Some games wrapped the
  unicode glyph in a `<button>` for click-to-keep. The engine already
  renders a `<button>`, so just pass `onClick` directly to `<Die>` and
  drop the outer button. If you need extra layout (e.g. an animation
  wrapper class), use a `<span>` or `<div>`.

- **Sentinel `?` placeholders.** Games render `<div className="die" style={{opacity:0.3}}>?</div>` when no roll has happened yet. Keep these unchanged — the engine has no "blank" face. Only replace the cells that show a real `1..6`.

- **Per-game CSS sizing.** Local `.dg-die`, `.dt25-die` etc. classes set
  `width`/`height`/`font-size`. After migration these no longer apply to
  the die itself (the engine uses its own `.die` width 64px). If a game
  needs a different size, wrap the `<Die>` in a sized container and use
  CSS `:has(.die)` or transform-scale, rather than fighting the engine.

- **Linter / pre-commit nuance.** If you remove the `FACES` const but
  leave one stale reference, the unused-var/undefined-var rule will fail
  and a pre-commit hook may revert your edit. Do both edits (delete const
  and rewrite the JSX) before running tools that re-read the file.

## 6. Reference: games already migrated

| Game | Notes |
| --- | --- |
| `pig`, `farkle-mini`, `generala`, `balut`, `mini-tenzi`, `mini-shut-box`, `straight-or-bust`, `boss-dice`, `liars-dice`, `roll-and-add`, `rolling-thunder-dice`, `mini-cee-lo`, `dice-darts` | Pre-existing — use as reference for Yahtzee/Farkle-style kept toggles |
| `dice-quick-roll`, `dice-pop-roll`, `dice-slow-roll`, `dice-flush-bet`, `dice-quad-bet` | 3-die roll, `.map` over `state.dice: number[]` |
| `dice-pair-roll`, `dice-add-bet`, `dice-step-bet` | 2/3-die roll inside `.dg-die` wrappers |
| `dice-bingo-mini`, `dice-coin-bet`, `dice-skip-bet` | Single `state.die: number` |
| `dice-streak-9`, `dice-mirror-roll` | Hit/correct highlight via wrapper span class |
| `dice-target-25` | Multi-die with **kept-toggle dispatch** — uses the spread-props trick from §5 |

## 7. Remaining work

The dice audit shows roughly **~85 game UI files** still using hand-rolled
die markup (Unicode `FACES`/`PIPS` const, or CSS `.die` boxes).

A grep approximation as of this writing:

```
grep -l '⚀\|⚁\|⚂\|⚃\|⚄\|⚅\|className="die\|FACES =\|PIPS =' \
  web/src/games/**/*.tsx | grep -v engines/dice
```

Breakdown of the ~85 remaining UI files (sampled):

- ~30 `dice-*` mini-games with the same `FACES` pattern as the batch above.
  These are mechanical 1-minute migrations.
- ~25 backgammon / race variants (`gul-bara`, `fevga-tavli`,
  `dueling-dice-backgammon`, `mahbusa`, `chouette`, etc.). These render two
  dice as part of a board; layout sensitive — bump effort.
- ~10 Yahtzee-family classics (`craps`, `centennial`, `crag`, `helan-gar`,
  `cosmic-wimpout`, etc.). Some have **non-1–6 faces** and need engine
  changes first.
- ~20 themed dice arcade games (`dice-football`, `dice-rocket`,
  `dice-soccer`, etc.) — straightforward but each has its own CSS that
  may need a wrapper.

**Effort estimate**

| Category | Count | Per-game | Total |
| --- | --- | --- | --- |
| Simple `FACES`/`PIPS` swap (1–2 dice) | ~50 | 2–3 min | 2–3 h |
| Multi-die with kept-toggle | ~15 | 5–8 min | 1.5–2 h |
| Backgammon-style board-embedded dice | ~15 | 10–15 min (layout) | 2.5–4 h |
| Custom-face games (engine extension first) | ~5 | block | needs design |

**Total**: ~6–9 hours of focused mechanical work, plus a small engine
extension if the team wants to cover the ~5 custom-face outliers.

Recommend driving the simple bucket as one PR (script-able), the
backgammon bucket as a second PR with screenshot review, and gating the
custom-face cluster behind an engine RFC.
