import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { RoyalRendezvousState, RoyalRendezvousAction, RoyalRendezvousSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { RoyalRendezvousGame } from "./Game.js";

const settings = { _dummy: { kind: "boolean" as const, label: "_", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const royalRendezvousPlugin: GamePlugin<RoyalRendezvousState, RoyalRendezvousAction, typeof settings> = {
  id: "royal-rendezvous",
  title: "Royal Rendezvous",
  category: "solitaire",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Two-deck Royal Rendezvous — same-colour packing.",
  howToPlay: "Two-deck Royal Rendezvous — same-colour packing. Use drag-and-drop or click a card to auto-move it to the best legal destination. The Auto-move button finishes the foundations once the board is solved.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as RoyalRendezvousSettings),
  reducer,
  isTerminal,
  component: RoyalRendezvousGame,
};
