import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { FindPrimeState, FindPrimeAction, FindPrimeSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { FindPrimeGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const findPrimePlugin: GamePlugin<FindPrimeState, FindPrimeAction, typeof settings> = {
  id: "find-prime", title: "Find the Prime", category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Spot the prime number among four. 20 rounds.",
  howToPlay: `Find the Prime is a quick number-theory drill. Each round shows you four numbers — exactly one is prime, and the other three are composite (have factors other than 1 and themselves). Tap the prime, hit Submit, and score 10 points if you're right.

Primes you'll see range from small basics like 2, 3, 5, 7 up through two-digit primes like 89 and 97. Composites are pulled from 4 through 99, so all four candidates fit on a small grid and stay readable.

A quick refresher: a prime number has exactly two positive divisors — 1 and itself. 2 is the smallest prime (and the only even one). Composites you'll spot include 4, 6, 8, 9, 10, 12, 15, 21, 25, 49, etc. If a number ends in 0, 2, 4, 6, or 8 (except 2 itself) it's never prime. If it ends in 5 (except 5 itself) it's never prime. The trickier ones — 51, 91, 87 — require trial division.

There are 20 rounds. Maximum score is 200 points!`,
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as FindPrimeSettings),
  reducer, isTerminal, hint: (state: FindPrimeState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-find-prime-answer-0"]', pulses: 3 } : null, component: FindPrimeGame,
};
