import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { TutTombState, TutTombAction, TutTombSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { TutTombGame } from "./Game.js";

const settings = { _dummy: { kind: "boolean" as const, label: "_", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const tutTombPlugin: GamePlugin<TutTombState, TutTombAction, typeof settings> = {
  id: "tut-tomb",
  title: "Tut's Tomb (Soli)",
  category: "solitaire",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Tut's Tomb pyramid variant with a single redeal.",
  howToPlay: "Tut's Tomb pyramid variant with a single redeal. Click a card to select it, then click another that pairs with it to sum thirteen — Kings drop alone. Use the stock when the pyramid stalls.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as TutTombSettings),
  reducer,
  isTerminal,
  component: TutTombGame,
};
