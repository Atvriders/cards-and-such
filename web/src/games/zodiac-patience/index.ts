import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { ZodiacPatienceState, ZodiacPatienceAction, ZodiacPatienceSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { ZodiacPatienceGame } from "./Game.js";

const settings = { _dummy: { kind: "boolean" as const, label: "_", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const zodiacPatiencePlugin: GamePlugin<ZodiacPatienceState, ZodiacPatienceAction, typeof settings> = {
  id: "zodiac-patience",
  title: "Zodiac Patience",
  category: "solitaire",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Twelve-zodiac slot variant of Clock Patience.",
  howToPlay: "Twelve-zodiac slot variant of Clock Patience. Click Tick to flip the held card into its rank-slot; the next card in that slot becomes the new held card. Win when every slot fills before the centre runs out.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as ZodiacPatienceSettings),
  reducer,
  isTerminal,
  component: ZodiacPatienceGame,
};
