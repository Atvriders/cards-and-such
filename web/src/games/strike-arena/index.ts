import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { StrikeArenaState, StrikeArenaAction, StrikeArenaSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const StrikeArenaGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.StrikeArenaGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const strikeArenaPlugin: GamePlugin<StrikeArenaState, StrikeArenaAction, typeof settings> = {
  id: "strike-arena",
  title: "Strike Arena",
  category: "dice",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Arena dice elimination — strike out matches before opponents.",
  howToPlay: "Strike, the 2008 Ravensburger arena dice game by Reiner Knizia, has players hurl dice into a cardboard arena and pick up only the dice that match. This adaptation simplifies the arena physics into pattern-matching predictions. Across 12 rounds four dice are rolled. Predict: Triple Match (three or four dice same value) pays +45, Double Pair (two distinct pairs in the four-dice roll) pays +25, No Match (no two dice equal) pays +8. Triples are rare but bountiful, Double Pair is moderate frequency with steady payout, No Match is around 28% likely with a small consolation prize. Wrong call scores zero. Strategy: punt Triple Match every third round to keep the +45 hits flowing — pure-Double-Pair averages near +75 across twelve rounds, but mixed strategies can clear +180. Twelve rounds, top score wins. Strike's original arena toss made it iconic at boardgame conventions; the dice statistics survive.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as StrikeArenaSettings),
  reducer,
  isTerminal,
  hint: (state) => {
    const phase = (state as any).phase;
    if (phase === "betting") return { selector: '[data-testid="hint-target-strike-arena-predict"]', pulses: 3 };
    if (phase === "bet") return { selector: '[data-testid="hint-target-strike-arena-predict"]', pulses: 3 };
    if (phase === "predict") return { selector: '[data-testid="hint-target-strike-arena-predict"]', pulses: 3 };
    if (phase === "predicting") return { selector: '[data-testid="hint-target-strike-arena-predict"]', pulses: 3 };
    if (phase === "roundOver") return { selector: '[data-testid="hint-target-strike-arena-next"]', pulses: 3 };
    if (phase === "result") return { selector: '[data-testid="hint-target-strike-arena-next"]', pulses: 3 };
    if (phase === "settled") return { selector: '[data-testid="hint-target-strike-arena-next"]', pulses: 3 };
    if (phase === "banked") return { selector: '[data-testid="hint-target-strike-arena-next"]', pulses: 3 };
    if (phase === "done") return { selector: '[data-testid="hint-target-strike-arena-next"]', pulses: 3 };
    if (phase === "farkled") return { selector: '[data-testid="hint-target-strike-arena-next"]', pulses: 3 };
    if (phase === "busted") return { selector: '[data-testid="hint-target-strike-arena-next"]', pulses: 3 };
    return { selector: '[data-testid="hint-target-strike-arena-next"]', pulses: 3 };
  },
  component: StrikeArenaGame,
};
