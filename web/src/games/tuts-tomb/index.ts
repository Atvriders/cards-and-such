import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { TutsTombState, TutsTombAction, TutsTombSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { TutsTombGame } from "./Game.js";

const settings = { _dummy: { kind: "boolean" as const, label: "_", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const tutsTombPlugin: GamePlugin<TutsTombState, TutsTombAction, typeof settings> = {
  id: "tuts-tomb",
  title: "Tut's Tomb",
  category: "solitaire",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Pyramid Solitaire themed around Tutankhamun — single redeal.",
  howToPlay: "Pyramid Solitaire themed around Tutankhamun — single redeal. Click a card to select it, then click another that pairs with it to sum thirteen — Kings drop alone. Use the stock when the pyramid stalls.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as TutsTombSettings),
  reducer,
  isTerminal,
  component: TutsTombGame,
};
