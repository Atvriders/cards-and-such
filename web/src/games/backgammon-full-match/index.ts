import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, SettingsOf, HintTarget } from "../../platform/game-plugin/types.js";
import type { MatchState, MatchAction, BackgammonMatchSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";

const FullMatchGame = /* @__PURE__ */ lazy(() =>
  import("./Game.js").then((mod) => ({ default: mod.BackgammonFullMatchGame as unknown as React.ComponentType<unknown> })),
);

const settings = {
  matchTarget: { kind: "number" as const, label: "Match Target", min: 1, max: 21, step: 2, default: 7 },
} as const;
type S = SettingsOf<typeof settings>;

export const backgammonFullMatchPlugin: GamePlugin<MatchState, MatchAction, typeof settings> = {
  id: "backgammon-full-match",
  title: "Backgammon Full Match",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Full-rules backgammon match play to 7 with doubling cube, Crawford rule, and a heuristic CPU.",
  howToPlay:
    "Backgammon Full Match is the canonical match-play edition of backgammon. You compete against the computer in a sequence of single games — first to reach the match target (default 7 points) wins the match.\n\n" +
    "Board: 24 points arranged in two rows. You (red) move counter-clockwise from point 24 toward point 1 and bear off when all 15 checkers are home (points 1-6). The CPU (dark) moves the opposite direction. Starting position is the standard rulebook: 2 on point 24, 5 on point 13, 3 on point 8, 5 on point 6 for one side; mirrored for the other.\n\n" +
    "On your turn: optionally offer the doubling cube before rolling, then roll. Two dice give two moves; doubles give four moves of that value. You may move the same checker for both dice or split them. You must use as many dice as legally possible.\n\n" +
    "Hits and bar: landing alone on the opponent's blot (a lone checker) sends them to the bar. A checker on the bar must re-enter the opponent's home quadrant before any other move is legal.\n\n" +
    "Bear off: once all 15 of your checkers are in your home quadrant you may bear them off the board. Exact rolls bear off directly; high rolls clear the highest occupied point.\n\n" +
    "Scoring: winning while the loser has borne off zero is a gammon (2x). Winning while the loser still has a checker on the bar or in your home board is a backgammon (3x). Multiply by the current cube value to get points awarded.\n\n" +
    "Doubling cube: before your roll you may offer to double the stakes. Your opponent takes (cube doubles, they own it) or drops (current cube value is awarded immediately and the next game starts). After taking, only the owner may subsequently offer to redouble.\n\n" +
    "Crawford rule: when one side first reaches match-point minus one, the doubling cube is disabled for one game. After that single Crawford game the cube is freely available again (post-Crawford rule).\n\n" +
    "CPU: heuristic evaluator combining pip count, blot exposure, home-board priming, and bar checkers. The CPU also offers and accepts the cube based on relative pip count.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as BackgammonMatchSettings),
  reducer,
  isTerminal,
  hint: (state: MatchState): HintTarget | null => {
    if (state.phase === "matchOver") return null;
    if (state.phase === "gameOver") return { selector: '[data-testid="hint-target-backgammon-full-match-primary"]', pulses: 3 };
    if (state.phase === "doubleOffered" && state.turn === "C") return { selector: '[data-testid="bg-take-double"]', pulses: 3 };
    if (state.phase === "preRoll" && state.turn === "P") return { selector: '[data-testid="hint-target-backgammon-full-match-primary"]', pulses: 3 };
    if (state.phase === "moving" && state.turn === "P") return { selector: '[data-testid="bg-end-turn"]', pulses: 3 };
    return null;
  },
  component: FullMatchGame,
};
