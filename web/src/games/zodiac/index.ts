import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { ZodiacState, ZodiacAction, ZodiacSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const ZodiacGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.ZodiacGame as unknown as React.ComponentType<unknown> })));
const settings = { _dummy: { kind: "boolean" as const, label: "_", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const zodiacPlugin: GamePlugin<ZodiacState, ZodiacAction, typeof settings> = {
  id: "zodiac",
  title: "Zodiac",
  category: "solitaire",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Zodiac — twelve houses, classic clock-style flow.",
  howToPlay: "Zodiac — twelve houses, classic clock-style flow. Click Tick to flip the held card into its rank-slot; the next card in that slot becomes the new held card. Win when every slot fills before the centre runs out.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as unknown as ZodiacSettings),
  hint: (state: ZodiacState): HintTarget | null => {
    if (state.won || state.lost) return null;
    if (state.held) {
      return { selector: '[data-testid="hint-target-zodiac-tick"]', pulses: 3 };
    }
    return null;
  },
  reducer,
  isTerminal,
  component: ZodiacGame,
};
