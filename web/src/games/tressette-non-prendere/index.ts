import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { TressetteNonPrendereState, TressetteNonPrendereAction, TressetteNonPrendereSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { TressetteNonPrendereGame } from "./Game.js";

const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const tre-npPlugin: GamePlugin<TressetteNonPrendereState, TressetteNonPrendereAction, typeof settings> = {
  id: "tressette-non-prendere",
  title: "Tressette Non Prendere",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Tressette Non Prendere — avoid taking points.",
  howToPlay: "Tressette Non Prendere — avoid taking points. Play heads-up against the CPU. Click cards in your hand to play. Follow the led suit if possible. Highest of led suit wins, unless beaten by trump. Score points for tricks won (or for card values, in some variants).",
  settings,
  initialState: (seed: number, _s: S) => initialState(seed, _s as TressetteNonPrendereSettings),
  reducer,
  isTerminal,
  component: TressetteNonPrendereGame,
};
