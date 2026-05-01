import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { SaboteurMiniState, SaboteurMiniAction, SaboteurMiniSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { SaboteurMiniGame } from "./Game.js";

const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const saboteur_mini_plugin: GamePlugin<SaboteurMiniState, SaboteurMiniAction, typeof settings> = {
  id: "saboteur-mini",
  title: "Saboteur Mini",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Find the saboteur miner.",
  howToPlay: "Saboteur Mini adapted as a logic-deduction puzzle: cycle each slot to set a guess, submit, and read the feedback (filled circles = exact, hollow = correct symbol but wrong slot). Crack the code in the allotted guesses to score.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as SaboteurMiniSettings),
  reducer,
  isTerminal,
  component: SaboteurMiniGame,
};

export default saboteur_mini_plugin;
