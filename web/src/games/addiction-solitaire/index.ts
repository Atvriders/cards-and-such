import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { AddictionSolitaireState, AddictionSolitaireAction, AddictionSolitaireSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { AddictionSolitaireGame } from "./Game.js";

const settings = { _dummy: { kind: "boolean" as const, label: "_", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const addictionSolPlugin: GamePlugin<AddictionSolitaireState, AddictionSolitaireAction, typeof settings> = {
  id: "addiction-solitaire",
  title: "Addiction Solitaire",
  category: "solitaire",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Addiction Solitaire — same engine as Montana / Gaps with two redeals.",
  howToPlay: "Addiction Solitaire — same engine as Montana / Gaps with two redeals. Click a card, then a gap to slide it in. A card can fill a gap only if its rank is one higher than the card to the gap's left and shares its suit. The leftmost column accepts only twos.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as AddictionSolitaireSettings),
  reducer,
  isTerminal,
  component: AddictionSolitaireGame,
};
