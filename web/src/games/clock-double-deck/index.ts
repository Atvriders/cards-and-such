import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { ClockDoubleDeckState, ClockDoubleDeckAction, ClockDoubleDeckSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { ClockDoubleDeckGame } from "./Game.js";

const settings = { _dummy: { kind: "boolean" as const, label: "_", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const clockDoubleDeckPlugin: GamePlugin<ClockDoubleDeckState, ClockDoubleDeckAction, typeof settings> = {
  id: "clock-double-deck",
  title: "Clock (Double Deck)",
  category: "solitaire",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Two-deck Clock Patience — eight cards per hour.",
  howToPlay: "Two-deck Clock Patience — eight cards per hour. Click Tick to flip the held card into its rank-slot; the next card in that slot becomes the new held card. Win when every slot fills before the centre runs out.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as ClockDoubleDeckSettings),
  reducer,
  isTerminal,
  component: ClockDoubleDeckGame,
};
