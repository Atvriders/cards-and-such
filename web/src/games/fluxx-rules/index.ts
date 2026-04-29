import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { FluxxRulesState, FluxxRulesAction, FluxxRulesSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { FluxxRulesGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const fluxxRulesPlugin: GamePlugin<FluxxRulesState, FluxxRulesAction, typeof settings> = {
  id: "fluxx-rules", title: "Fluxx Rules", category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Pick the hand satisfying current Goal card.",
  howToPlay: "Fluxx Rules captures the wild rule-shifting card game's signature challenge: matching hand-state to current Goal. Each of twelve rounds shows you a Goal card ('3 Keepers', '2 Keepers + 1 Action', '1 Keeper + 2 Goal cards', '4 Keepers') and four candidate hands. Pick the hand that satisfies the goal, hit Submit, score ten points. Max 120 points across twelve rounds. The original Fluxx mechanism has rules and goals constantly changing as players draw cards from the deck. This digital version tests the core matching skill — recognizing whether a given hand satisfies a goal pattern. Fluxx fans hit 100+; first-timers 60-90. Hit Submit and Next to advance. Total run takes about a minute. A perfect score certifies you understand the goal-matching backbone of all the Fluxx variants (Star Fluxx, Zombie Fluxx, Cthulhu Fluxx, etc.). Use as a warm-up before live Fluxx games.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as FluxxRulesSettings),
  reducer, isTerminal, component: FluxxRulesGame,
};
