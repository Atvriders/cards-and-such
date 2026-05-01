import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { MysteriumVisionsState, MysteriumVisionsAction, MysteriumVisionsSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { MysteriumVisionsGame } from "./Game.js";

const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const mysterium_visions_plugin: GamePlugin<MysteriumVisionsState, MysteriumVisionsAction, typeof settings> = {
  id: "mysterium-visions",
  title: "Mysterium Visions",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Decipher ghost visions to identify the killer.",
  howToPlay: "Mysterium Visions adapted as a logic-deduction puzzle: cycle each slot to set a guess, submit, and read the feedback (filled circles = exact, hollow = correct symbol but wrong slot). Crack the code in the allotted guesses to score.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as MysteriumVisionsSettings),
  reducer,
  isTerminal,
  component: MysteriumVisionsGame,
};

export default mysterium_visions_plugin;
