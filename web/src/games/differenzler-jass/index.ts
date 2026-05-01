import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { DifferenzlerJassState, DifferenzlerJassAction, DifferenzlerJassSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { DifferenzlerJassGame } from "./Game.js";

const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const dif-jPlugin: GamePlugin<DifferenzlerJassState, DifferenzlerJassAction, typeof settings> = {
  id: "differenzler-jass",
  title: "Differenzler Jass",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Differenzler Jass — guess your point total.",
  howToPlay: "Differenzler Jass — guess your point total. Play heads-up against the CPU. Click cards in your hand to play. Follow the led suit if possible. Highest of led suit wins, unless beaten by trump. Score points for tricks won (or for card values, in some variants).",
  settings,
  initialState: (seed: number, _s: S) => initialState(seed, _s as DifferenzlerJassSettings),
  reducer,
  isTerminal,
  component: DifferenzlerJassGame,
};
