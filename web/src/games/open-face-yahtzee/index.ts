import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { OpenFaceYahtzeeState, OpenFaceYahtzeeAction, OpenFaceYahtzeeSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const OpenFaceYahtzeeGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.OpenFaceYahtzeeGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const openFaceYahtzeePlugin: GamePlugin<OpenFaceYahtzeeState, OpenFaceYahtzeeAction, typeof settings> = {
  id: "open-face-yahtzee",
  title: "Open Face Yahtzee",
  category: "dice",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Yahtzee with revealed dice — call the visible category before scoring.",
  howToPlay: "Open Face Yahtzee plays like the classic Yahtzee but with dice visible to all players each turn — no hidden re-rolls. Across 12 rounds five dice are rolled face-up. You read the table and claim one of three category bands: a Straight Run (1-2-3-4-5 or 2-3-4-5-6) pays +40, a Three-Pair-look (any two distinct pairs) pays +25, a Quad (four of a kind or better) pays +50, or you can Bust for zero. The trick is matching the call to the actual roll — Quads are rare but lucrative, Three Pair is common and steady, the Straight is medium-frequency. Wrong category scores zero. Strategy: count dots fast and choose Quad only when you actually see four matching faces. Twelve rounds, top score wins. Open Face is a popular tournament-friendly variant because it removes the bluffing gap between players. Average expected score is around 200.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as OpenFaceYahtzeeSettings),
  reducer,
  isTerminal,
  hint: (state) => {
    const phase = (state as any).phase;
    if (phase === "betting") return { selector: '[data-testid="hint-target-open-face-yahtzee-predict"]', pulses: 3 };
    if (phase === "bet") return { selector: '[data-testid="hint-target-open-face-yahtzee-predict"]', pulses: 3 };
    if (phase === "predict") return { selector: '[data-testid="hint-target-open-face-yahtzee-predict"]', pulses: 3 };
    if (phase === "predicting") return { selector: '[data-testid="hint-target-open-face-yahtzee-predict"]', pulses: 3 };
    if (phase === "roundOver") return { selector: '[data-testid="hint-target-open-face-yahtzee-next"]', pulses: 3 };
    if (phase === "result") return { selector: '[data-testid="hint-target-open-face-yahtzee-next"]', pulses: 3 };
    if (phase === "settled") return { selector: '[data-testid="hint-target-open-face-yahtzee-next"]', pulses: 3 };
    if (phase === "banked") return { selector: '[data-testid="hint-target-open-face-yahtzee-next"]', pulses: 3 };
    if (phase === "done") return { selector: '[data-testid="hint-target-open-face-yahtzee-next"]', pulses: 3 };
    if (phase === "farkled") return { selector: '[data-testid="hint-target-open-face-yahtzee-next"]', pulses: 3 };
    if (phase === "busted") return { selector: '[data-testid="hint-target-open-face-yahtzee-next"]', pulses: 3 };
    return { selector: '[data-testid="hint-target-open-face-yahtzee-next"]', pulses: 3 };
  },
  component: OpenFaceYahtzeeGame,
};
