import type { GamePlugin, HintTarget} from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { DiceFrenzyMiniState, DiceFrenzyMiniAction, DiceFrenzyMiniSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { DiceFrenzyMiniGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const diceFrenzyMiniPlugin: GamePlugin<DiceFrenzyMiniState, DiceFrenzyMiniAction, typeof settings> = {
  id: "dice-frenzy-mini", title: "Dice Frenzy Mini", category: "dice",
  players: { min: 1, max: 1, multiplayer: false },
  description: "10 dice, sum-to-target challenge. 8 rounds.",
  howToPlay: `Dice Frenzy Mini is a subset-sum dice puzzle. Each round, ten six-sided dice are rolled and a target sum (between 30 and 40) is announced. Your task: tap dice to select a subset whose values sum to the target.

Tap a die to select or deselect it. Selected dice glow green and contribute to the running total. When you're satisfied, hit Lock In to score. Scoring rewards proximity: 50 points minus 5 times the absolute distance from target. So an exact match is 50 points, off by 1 is 45, off by 2 is 40, ..., and off by 10+ is 0.

The total of all 10 dice is between 10 (all 1s) and 60 (all 6s), so finding any sum between 30 and 40 is almost always possible — though not always with an exact match. Strategy: pick a few large dice first to get close, then adjust with smaller dice. The expected total of 10 dice is 35, so the puzzle hovers around the middle of the achievable range.

There are 8 rounds. Maximum theoretical score: 8 × 50 = 400 points!`,
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as DiceFrenzyMiniSettings),
  reducer, isTerminal, hint: (state): HintTarget | null => (state.phase === "done" ? null : { selector: '[data-testid="hint-target-dice-frenzy-mini-primary"]', pulses: 3 }), component: DiceFrenzyMiniGame,
};
