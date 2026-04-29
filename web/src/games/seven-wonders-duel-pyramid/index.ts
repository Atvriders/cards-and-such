import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { SevenWondersDuelPyramidState, SevenWondersDuelPyramidAction, SevenWondersDuelPyramidSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { SevenWondersDuelPyramidGame } from "./Game.js";

const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const sevenWondersDuelPyramidPlugin: GamePlugin<SevenWondersDuelPyramidState, SevenWondersDuelPyramidAction, typeof settings> = {
  id: "seven-wonders-duel-pyramid",
  title: "7 Wonders Duel: Pyramid",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Two-player pyramid card-acquisition homage.",
  howToPlay: "7 Wonders Duel: Pyramid is a homage to the two-player Antoine Bauza and Bruno Cathala game, where cards are arranged in a pyramid layout and players take turns picking accessible cards. Each round three cards appear: pick one, the CPU takes the highest of the rest. Across eight rounds you build a tableau across the four suits. Three of one suit earn +10 (a science set); five earn an additional +15 (a science victory). Pairs of rank earn +5 (a military advance); three-of-a-kind +10 (a military victory). Raw ranks sum as commerce. Score equals tableau total plus +25 for beating the CPU. Strategy: head-to-head focus rewards denying the CPU's preferred suit. Aim for 70-110 with the bonus.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as SevenWondersDuelPyramidSettings),
  reducer,
  isTerminal,
  component: SevenWondersDuelPyramidGame,
};
