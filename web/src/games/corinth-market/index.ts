import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { CorinthMarketState, CorinthMarketAction, CorinthMarketSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const CorinthMarketGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.CorinthMarketGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const corinthMarketPlugin: GamePlugin<CorinthMarketState, CorinthMarketAction, typeof settings> = {
  id: "corinth-market",
  title: "Corinth Market",
  category: "dice",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Corinth — roll 7 dice, pick goods, fill market columns.",
  howToPlay: `Corinth Market is a 10-roll dice-and-mark game with themed scoring.

How to play
1. Press Roll to throw a d6.
2. Click any unmarked cell on the 4x4 grid to mark it with that value.
3. Score = die value + zone bonus + adjacency bonus (matching value next door).
4. Skip if no good spot — that roll is wasted.

Theme: Column of same value: +pyramid bonus.

End-of-game bonuses
- Full row: +4 each
- Full column: +4 each
- Full board: +12

The game ends after 10 rolls (or earlier if all 16 cells are filled). Maximum reachable depends on a balanced spread; aim for 50-80 in a strong run.`,
  settings,
  initialState: (seed, s) => initialState(seed, s as CorinthMarketSettings),
  reducer,
  isTerminal,
  hint: (state) => {
    const phase = (state as any).phase;
    if (phase === "rolling") return { selector: '[data-testid="hint-target-corinth-market-roll"]', pulses: 3 };
    if (phase === "rolling-dice") return { selector: '[data-testid="hint-target-corinth-market-roll"]', pulses: 3 };
    if (phase === "preRoll") return { selector: '[data-testid="hint-target-corinth-market-roll"]', pulses: 3 };
    if (phase === "ready") return { selector: '[data-testid="hint-target-corinth-market-roll"]', pulses: 3 };
    if (phase === "playerRoll") return { selector: '[data-testid="hint-target-corinth-market-roll"]', pulses: 3 };
    if (phase === "roll") return { selector: '[data-testid="hint-target-corinth-market-roll"]', pulses: 3 };
    if (phase === "play") return { selector: '[data-testid="hint-target-corinth-market-roll"]', pulses: 3 };
    if (phase === "playing") return { selector: '[data-testid="hint-target-corinth-market-roll"]', pulses: 3 };
    if (phase === "marking") return { selector: '[data-testid="hint-target-corinth-market-mark"]', pulses: 3 };
    if (phase === "mark") return { selector: '[data-testid="hint-target-corinth-market-mark"]', pulses: 3 };
    return { selector: '[data-testid="hint-target-corinth-market-roll"]', pulses: 3 };
  },
  component: CorinthMarketGame,
};
