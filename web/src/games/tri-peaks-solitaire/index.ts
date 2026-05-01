import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { TriPeaksSolitaireState, TriPeaksSolitaireAction, TriPeaksSolitaireSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { TriPeaksSolitaireGame } from "./Game.js";

const settings = { _dummy: { kind: "boolean" as const, label: "_", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const triPeaksSolitairePlugin: GamePlugin<TriPeaksSolitaireState, TriPeaksSolitaireAction, typeof settings> = {
  id: "tri-peaks-solitaire",
  title: "Tri-Peaks Solitaire",
  category: "solitaire",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Three-peak board: clear cards rank-adjacent to the waste top.",
  howToPlay: "Three-peak board: clear cards rank-adjacent to the waste top. Click any available column-top whose rank is one above or below the waste top to play it; draw from the stock when the board stalls.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as TriPeaksSolitaireSettings),
  reducer,
  isTerminal,
  component: TriPeaksSolitaireGame,
};
