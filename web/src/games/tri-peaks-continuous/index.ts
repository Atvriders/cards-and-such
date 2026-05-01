import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { TriPeaksContinuousState, TriPeaksContinuousAction, TriPeaksContinuousSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { TriPeaksContinuousGame } from "./Game.js";

const settings = { _dummy: { kind: "boolean" as const, label: "_", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const triPeaksContinuousPlugin: GamePlugin<TriPeaksContinuousState, TriPeaksContinuousAction, typeof settings> = {
  id: "tri-peaks-continuous",
  title: "Tri-Peaks Continuous",
  category: "solitaire",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Tri-Peaks with infinite stock recycling — a more forgiving variant.",
  howToPlay: "Tri-Peaks with infinite stock recycling — a more forgiving variant. Click any available column-top whose rank is one above or below the waste top to play it; draw from the stock when the board stalls.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as TriPeaksContinuousSettings),
  reducer,
  isTerminal,
  component: TriPeaksContinuousGame,
};
