import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { IdiotsDelightState, IdiotsDelightAction, IdiotsDelightSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const IdiotsDelightGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.IdiotsDelightGame as unknown as React.ComponentType<unknown> })));
const settings = { _dummy: { kind: "boolean" as const, label: "_", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const idiotsDelightPlugin: GamePlugin<IdiotsDelightState, IdiotsDelightAction, typeof settings> = {
  id: "idiots-delight",
  title: "Idiot's Delight",
  category: "solitaire",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Aces Up variant — drop the lower of any same-suit pair, leave the four aces.",
  howToPlay: "Aces Up variant — drop the lower of any same-suit pair, leave the four aces. Click a column to select it, click again to discard the top (legal only if a higher same-suit lurks elsewhere); click another column to move into an empty slot. Goal: only the four Aces remain.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as unknown as IdiotsDelightSettings),
  hint: (state: IdiotsDelightState): HintTarget | null => {
    if (state.won) return null;
    type Top = { col: number; suit: string; rank: number };
    const tops: Top[] = [];
    for (let i = 0; i < state.columns.length; i++) {
      const col = state.columns[i]!;
      if (col.length === 0) continue;
      const t = col[col.length - 1]!;
      const r = t.rank === 1 ? 14 : (t.rank as number);
      tops.push({ col: i, suit: t.suit as unknown as string, rank: r });
    }
    for (const a of tops) {
      for (const b of tops) {
        if (a === b) continue;
        if (a.suit === b.suit && a.rank < b.rank) {
          return { selector: `[data-testid="hint-target-idiots-delight-${a.col}"]`, pulses: 3 };
        }
      }
    }
    if (state.stock.length > 0) {
      return { selector: '[data-testid="hint-target-idiots-delight-deal"]', pulses: 3 };
    }
    return null;
  },
  reducer,
  isTerminal,
  component: IdiotsDelightGame,
};
