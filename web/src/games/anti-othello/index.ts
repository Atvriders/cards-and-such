import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { AntiOthelloState, AntiOthelloAction, AntiOthelloSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const AntiOthelloGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.AntiOthelloGame as unknown as React.ComponentType<unknown> })));
const settings = {
  botStrength: { kind: "enum" as const, label: "Bot", options: ["easy", "hard"] as const, default: "easy" as const },
} as const;

type S = SettingsOf<typeof settings>;

export const antiOthelloPlugin: GamePlugin<AntiOthelloState, AntiOthelloAction, typeof settings> = {
  id: "anti-othello",
  title: "Anti-Othello",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Reversi misère. Same flipping rules — but the player with the FEWEST discs wins.",
  howToPlay: `Anti-Othello (Reversi misère) plays exactly like Othello, except the goal is reversed: when no one can move, the player with the FEWEST discs of their colour wins.

Place a disc on a highlighted square so that one or more of your opponent's discs are sandwiched in a straight line by your disc and one of your existing discs. All sandwiched discs flip to your colour. You're forced to move if you can — only pass when you genuinely have no legal placement.

Strategy is inverted: you want to avoid building a big mass of your colour. Force your opponent into long flips, target moves that flip few discs, and watch out for endgame parity.

Scoring: win = 100 + (opponent discs − your discs) × 5; draw = 50; loss = max(0, opponent discs − 10).`,
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as AntiOthelloSettings),
  reducer,
  isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "done" || p === "gameover" || p === "ended" || p === "finished" || (s as any).gameOver || (s as any).won || (s as any).complete || (s as any).isComplete) return null; return { selector: ".antiothello-pass", pulses: 3 }; },
  component: AntiOthelloGame,
};
