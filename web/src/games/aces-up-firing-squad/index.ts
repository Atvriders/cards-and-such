import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { AcesUpFiringSquadState, AcesUpFiringSquadAction, AcesUpFiringSquadSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { AcesUpFiringSquadGame } from "./Game.js";

const settings = { _dummy: { kind: "boolean" as const, label: "_", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const acesUpFiringSquadPlugin: GamePlugin<AcesUpFiringSquadState, AcesUpFiringSquadAction, typeof settings> = {
  id: "aces-up-firing-squad",
  title: "Aces Up (Firing Squad)",
  category: "solitaire",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Aces Up firing-squad rules — only the absolute highest of each suit gets the boot.",
  howToPlay: "Aces Up firing-squad rules — only the absolute highest of each suit gets the boot. Click a column to select it, click again to discard the top (legal only if a higher same-suit lurks elsewhere); click another column to move into an empty slot. Goal: only the four Aces remain.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as AcesUpFiringSquadSettings),
  reducer,
  isTerminal,
  component: AcesUpFiringSquadGame,
};
