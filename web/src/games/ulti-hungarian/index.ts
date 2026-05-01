import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { UltiHungarianState, UltiHungarianAction, UltiHungarianSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { UltiHungarianGame } from "./Game.js";

const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const ultiPlugin: GamePlugin<UltiHungarianState, UltiHungarianAction, typeof settings> = {
  id: "ulti-hungarian",
  title: "Ulti",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Ulti — Hungarian 32-card bidding trick game.",
  howToPlay: "Ulti — Hungarian 32-card bidding trick game. Play heads-up against the CPU. Click cards in your hand to play. Follow the led suit if possible. Highest of led suit wins, unless beaten by trump. Score points for tricks won (or for card values, in some variants).",
  settings,
  initialState: (seed: number, _s: S) => initialState(seed, _s as UltiHungarianSettings),
  reducer,
  isTerminal,
  component: UltiHungarianGame,
};
