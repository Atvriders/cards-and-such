import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { TressetteMortoState, TressetteMortoAction, TressetteMortoSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { TressetteMortoGame } from "./Game.js";

const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const tre-mPlugin: GamePlugin<TressetteMortoState, TressetteMortoAction, typeof settings> = {
  id: "tressette-morto",
  title: "Tressette Morto",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Tressette Morto — dummy hand variant.",
  howToPlay: "Tressette Morto — dummy hand variant. Play heads-up against the CPU. Click cards in your hand to play. Follow the led suit if possible. Highest of led suit wins, unless beaten by trump. Score points for tricks won (or for card values, in some variants).",
  settings,
  initialState: (seed: number, _s: S) => initialState(seed, _s as TressetteMortoSettings),
  reducer,
  isTerminal,
  component: TressetteMortoGame,
};
