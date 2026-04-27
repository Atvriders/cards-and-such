import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { FindCompositeState, FindCompositeAction, FindCompositeSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { FindCompositeGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const findCompositePlugin: GamePlugin<FindCompositeState, FindCompositeAction, typeof settings> = {
  id: "find-composite", title: "Find the Composite", category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Spot the composite number among four. 20 rounds.",
  howToPlay: `Find the Composite is the inverse of the prime hunt. Each round shows you four numbers — exactly one is composite (has factors other than 1 and itself), and the other three are prime. Tap the composite, hit Submit, and score 10 points if you nailed it.

Composites are pulled from 4 through 99, including obvious ones (4, 6, 8, 9, 10, 25, 49, 81) and trickier ones (51 = 3×17, 91 = 7×13, 87 = 3×29). Primes you'll see range from 2 up to 97. Quick rules: any even number greater than 2 is composite, anything ending in 5 (except 5 itself) is composite, and anything whose digits sum to a multiple of 3 is divisible by 3 — and therefore composite if it's larger than 3.

The deceptive ones tend to look prime: 51, 57, 87, 91, 93. Always test small primes (2, 3, 5, 7, 11) before committing.

There are 20 rounds. Maximum is 200 points!`,
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as FindCompositeSettings),
  reducer, isTerminal, component: FindCompositeGame,
};
