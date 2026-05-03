import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget, SettingsOf } from "../../platform/game-plugin/types.js";
import type { OpenFaceChineseState, OpenFaceChineseAction, OpenFaceChineseSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const OpenFaceChineseGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.OpenFaceChineseGame as unknown as React.ComponentType<unknown> })));
const settings = {
  rounds: { kind: "enum" as const, label: "Rounds", options: ["1", "3", "5"] as const, default: "3" },
} as const;
type S = SettingsOf<typeof settings>;

export const openFaceChinesePlugin: GamePlugin<OpenFaceChineseState, OpenFaceChineseAction, typeof settings> = {
  id: "open-face-chinese",
  title: "Open-Face Chinese Poker",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Heads-up OFC: place 13 cards across top (3) / middle (5) / bottom (5). Bottom must be >= middle >= top.",
  howToPlay:
    "Open-Face Chinese Poker (OFC) is a placement-based 13-card poker variant. You receive 13 cards and must place them one-by-one across three rows:\n\n- Top: 3 cards (ranked as 3-card hand: trips/pair/high)\n- Middle: 5 cards\n- Bottom: 5 cards\n\nThe hand must be valid: bottom must be stronger than middle, and middle must be stronger than top. Otherwise the hand 'fouls' and you lose all three rows.\n\nScoring: 1 point per row won vs CPU; sweeping all 3 rows earns a +3 bonus.\n\nClick a row button (Top/Mid/Bot) to place each card.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as OpenFaceChineseSettings),
  reducer,
  isTerminal,
  hint: (state: OpenFaceChineseState): HintTarget | null => {
    if (state.phase === "done") return null;
    if (state.phase === "scored") return { selector: '[data-testid="hint-target-ofc-deal"]', pulses: 3 };
    if (state.phase === "placing" && state.cardIdx === 0 && state.player.top.length === 0) {
      return { selector: '[data-testid="hint-target-ofc-deal"]', pulses: 3 };
    }
    if (state.phase === "placing" && state.cardIdx < state.hand.length) {
      const card = state.hand[state.cardIdx]!;
      const r = card.rank === 1 ? 14 : card.rank;
      const canTop = state.player.top.length < 3;
      const canMid = state.player.middle.length < 5;
      const canBot = state.player.bottom.length < 5;
      // Heuristic: low cards go top (3-card hand bracket), high cards go bottom (strongest row).
      if (r >= 11 && canBot) return { selector: '[data-testid="hint-target-ofc-bot"]', pulses: 3 };
      if (r <= 6 && canTop) return { selector: '[data-testid="hint-target-ofc-top"]', pulses: 3 };
      if (canMid) return { selector: '[data-testid="hint-target-ofc-mid"]', pulses: 3 };
      if (canBot) return { selector: '[data-testid="hint-target-ofc-bot"]', pulses: 3 };
      if (canTop) return { selector: '[data-testid="hint-target-ofc-top"]', pulses: 3 };
    }
    return null;
  },
  component: OpenFaceChineseGame,
};
