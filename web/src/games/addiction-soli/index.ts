import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { AddictionSoliState, AddictionSoliAction, AddictionSoliSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { AddictionSoliGame } from "./Game.js";

const settings = { _dummy: { kind: "boolean" as const, label: "_", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const addictionSoliPlugin: GamePlugin<AddictionSoliState, AddictionSoliAction, typeof settings> = {
  id: "addiction-soli",
  title: "Addiction Soli",
  category: "solitaire",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Addiction Solitaire variant.",
  howToPlay: "Addiction Solitaire variant. Click a card, then a gap to slide it in. A card can fill a gap only if its rank is one higher than the card to the gap's left and shares its suit. The leftmost column accepts only twos.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as AddictionSoliSettings),
  reducer,
  isTerminal,
  component: AddictionSoliGame,
};
