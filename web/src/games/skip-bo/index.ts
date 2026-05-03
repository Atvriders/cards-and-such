import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { SkipBoState, SkipBoAction, SkipBoSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { SkipBoGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const skipBoPlugin: GamePlugin<SkipBoState, SkipBoAction, typeof settings> = {
  id: "skip-bo", title: "Skip-Bo", category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Sequence-building shedding from a personal stockpile.",
  howToPlay: "Skip-Bo is a shedding card game where each player has a personal stockpile of thirty cards face-down. The objective is to empty your stockpile by playing cards onto four shared central build piles in sequence from one through twelve. You also have a hand of five cards (refilled to five each turn) and four discard piles you can manage. Skip-Bo wild cards substitute for any number. In this one-on-one CPU duel across six rounds, click Play Round to simulate the stockpile race. Strategy: never block your own discard piles by building unsorted; keep one pile dedicated to high cards (10-12), one to lows (1-3), and the others flexible. Save Skip-Bo wild cards for unblocking critical sequences. Going out (emptying stockpile) scores twenty-five points plus five per stockpile card the CPU has remaining. Aim for at least three round wins. A total above one hundred is a strong Skip-Bo result.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as SkipBoSettings),
  reducer, isTerminal,
  hint: (state: any) => {
    if (state.phase === "ready") return { selector: '[data-testid="hint-target-skip-bo-primary"]', pulses: 3 };
    if (state.phase === "scored") return { selector: '[data-testid="hint-target-skip-bo-next"]', pulses: 3 };
    return null;
  }, component: SkipBoGame,
};
