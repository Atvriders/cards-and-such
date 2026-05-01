import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { GapsTwoDeckState, GapsTwoDeckAction, GapsTwoDeckSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { GapsTwoDeckGame } from "./Game.js";

const settings = { _dummy: { kind: "boolean" as const, label: "_", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const gapsTwoDeckPlugin: GamePlugin<GapsTwoDeckState, GapsTwoDeckAction, typeof settings> = {
  id: "gaps-two-deck",
  title: "Gaps (Two Deck)",
  category: "solitaire",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Two-deck Gaps — slide cards into matching-suit ascending sequences.",
  howToPlay: "Two-deck Gaps — slide cards into matching-suit ascending sequences. Click a card, then a gap to slide it in. A card can fill a gap only if its rank is one higher than the card to the gap's left and shares its suit. The leftmost column accepts only twos.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as GapsTwoDeckSettings),
  reducer,
  isTerminal,
  component: GapsTwoDeckGame,
};
