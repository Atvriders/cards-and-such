import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { AwkwardGuestsState, AwkwardGuestsAction, AwkwardGuestsSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { AwkwardGuestsGame } from "./Game.js";

const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const awkward_guests_plugin: GamePlugin<AwkwardGuestsState, AwkwardGuestsAction, typeof settings> = {
  id: "awkward-guests",
  title: "Awkward Guests",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Cluedo-style detective deduction.",
  howToPlay: "Awkward Guests adapted as a logic-deduction puzzle: cycle each slot to set a guess, submit, and read the feedback (filled circles = exact, hollow = correct symbol but wrong slot). Crack the code in the allotted guesses to score.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as AwkwardGuestsSettings),
  reducer,
  isTerminal,
  component: AwkwardGuestsGame,
};

export default awkward_guests_plugin;
