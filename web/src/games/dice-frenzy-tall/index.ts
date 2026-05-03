import type { GamePlugin, HintTarget} from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { DiceFrenzyTallState, DiceFrenzyTallAction, DiceFrenzyTallSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { DiceFrenzyTallGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const diceFrenzyTallPlugin: GamePlugin<DiceFrenzyTallState, DiceFrenzyTallAction, typeof settings> = {
  id: "dice-frenzy-tall", title: "Dice Frenzy Tall", category: "dice",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Stack 5 dice in non-decreasing order. One reroll allowed.",
  howToPlay: `Dice Frenzy Tall is a stacking puzzle where order matters. Each round, five six-sided dice are rolled in a fixed left-to-right line. Your goal: have the values be non-decreasing (each die ≥ the one before it). For example, 1-2-3-5-6 is valid; 2-3-1-4-5 is not.

You get one reroll per round. Tap the dice you want to reroll (they highlight in gold), then hit Reroll. The selected dice are re-rolled in place; the others stay. After your reroll (or if you choose to skip it), hit Lock to score.

A successful ascending stack scores 30 points. A failed stack scores 0. There are 6 rounds, so the maximum score is 180.

Strategy: identify the worst-positioned dice first. If you've got 1-5-3-4-6, the 5 ruins the order — reroll just the 5 hoping for a 2 or 3. With one reroll only, careful targeting matters more than rerolling everything. The probability of randomly rolling a non-decreasing sequence of 5 dice from 6-sided dice is roughly 18%, so plan accordingly.`,
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as DiceFrenzyTallSettings),
  reducer, isTerminal, hint: (state): HintTarget | null => (state.phase === "done" ? null : { selector: '[data-testid="hint-target-dice-frenzy-tall-primary"]', pulses: 3 }), component: DiceFrenzyTallGame,
};
