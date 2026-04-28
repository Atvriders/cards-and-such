import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { ThreesBarDiceState, ThreesBarDiceAction, ThreesBarDiceSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { ThreesBarDiceGame } from "./Game.js";

const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const threesBarDicePlugin: GamePlugin<ThreesBarDiceState, ThreesBarDiceAction, typeof settings> = {
  id: "bar-dice-threes",
  title: "Threes Bar Dice",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Bar dice. Threes are wild; lowest non-wild combination after rerolls.",
  howToPlay: "Threes Bar Dice is a five-dice pub-bar variant where 3s are wild. After three rerolls, the lowest non-wild combination wins. In this simplified single-press version, each turn the engine simulates the three-roll sequence: it rolls, identifies wilds, optimizes rerolls, and scores the result. You press Roll once per turn and get a score from 0 to 20: 5% chance of a perfect bullseye (all wild plus lowest non-wild), descending tiers to a complete miss. Press Next after each roll to advance. Across ten turns, average totals run 60-90. Great totals exceed 130. The classic in-pub mechanic, choosing which dice to keep and reroll, is here distilled into a pure dice-luck score, but the distribution captures the rhythm of three-reroll bar-dice tension. Threes-as-wild is what makes this variant statistically unique.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as ThreesBarDiceSettings),
  reducer,
  isTerminal,
  component: ThreesBarDiceGame,
};
