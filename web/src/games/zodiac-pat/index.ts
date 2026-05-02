import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { ZodiacPatState, ZodiacPatAction, ZodiacPatSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { ZodiacPatGame } from "./Game.js";

const settings = { _dummy: { kind: "boolean" as const, label: "_", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const zodiacPatPlugin: GamePlugin<ZodiacPatState, ZodiacPatAction, typeof settings> = {
  id: "zodiac-pat",
  title: "Zodiac Solitaire",
  category: "solitaire",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Zodiac patience variant — same wheel, single deck.",
  howToPlay: "Zodiac patience variant — same wheel, single deck. Click Tick to flip the held card into its rank-slot; the next card in that slot becomes the new held card. Win when every slot fills before the centre runs out.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as ZodiacPatSettings),
  reducer,
  isTerminal,
  hint: (state) => isTerminal(state) ? null : { selector: ".play-restart-btn", pulses: 3 },
  component: ZodiacPatGame,
};
