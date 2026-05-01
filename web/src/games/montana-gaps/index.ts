import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { MontanaGapsState, MontanaGapsAction, MontanaGapsSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { MontanaGapsGame } from "./Game.js";

const settings = { _dummy: { kind: "boolean" as const, label: "_", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const montanaGapsPlugin: GamePlugin<MontanaGapsState, MontanaGapsAction, typeof settings> = {
  id: "montana-gaps",
  title: "Montana Gaps",
  category: "solitaire",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Montana / Gaps: 4×13 grid, slot the next-rank-same-suit into each gap.",
  howToPlay: "Montana / Gaps: 4×13 grid, slot the next-rank-same-suit into each gap. Click a card, then a gap to slide it in. A card can fill a gap only if its rank is one higher than the card to the gap's left and shares its suit. The leftmost column accepts only twos.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as MontanaGapsSettings),
  reducer,
  isTerminal,
  component: MontanaGapsGame,
};
