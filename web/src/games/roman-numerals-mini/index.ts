import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { RomanNumeralsMiniState, RomanNumeralsMiniAction, RomanNumeralsMiniSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { RomanNumeralsMiniGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const romanNumeralsMiniPlugin: GamePlugin<RomanNumeralsMiniState, RomanNumeralsMiniAction, typeof settings> = {
  id: "roman-numerals-mini", title: "Roman Numerals Mini", category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Convert Roman numerals to integers. 20 rounds.",
  howToPlay: `Roman Numerals Mini is a quick conversion drill. Each round shows you a Roman numeral somewhere between I and C (1 and 100). You pick the matching integer from four numeric choices, hit Submit, and score 10 points if you nailed it.

A quick refresher on the symbols: I = 1, V = 5, X = 10, L = 50, C = 100. Symbols normally add (VII = 7), but a smaller value placed before a larger one subtracts: IV = 4, IX = 9, XL = 40, XC = 90. The rules forbid putting a small symbol before something more than ten times its size, so IL is not valid for 49 — it's XLIX.

The four choices cluster near the right answer (within ±10), so you can't simply guess by magnitude. Decode the symbols carefully — long strings like XCVII (97) and LXXXVIII (88) are the trickiest.

There are 20 rounds and no timer; accuracy matters more than speed. Maximum score is 200 points. Sharpen those classical-language reflexes!`,
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as RomanNumeralsMiniSettings),
  reducer, isTerminal, hint: (state: RomanNumeralsMiniState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-roman-numerals-mini-answer-0"]', pulses: 3 } : null, component: RomanNumeralsMiniGame,
};
