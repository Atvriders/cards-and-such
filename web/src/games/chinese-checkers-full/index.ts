import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget, SettingsOf } from "../../platform/game-plugin/types.js";
import type { CCFState, CCFAction, CCFSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";

const ChineseCheckersFullGame = /* @__PURE__ */ lazy(() =>
  import("./Game.js").then((mod) => ({
    default: mod.ChineseCheckersFullGame as unknown as React.ComponentType<unknown>,
  })),
);

const settings = {
  mode: {
    kind: "enum" as const,
    label: "Move mode",
    options: ["jump-or-step", "jump-only"] as const,
    default: "jump-or-step" as const,
  },
} as const;

type S = SettingsOf<typeof settings>;

export const chineseCheckersFullPlugin: GamePlugin<CCFState, CCFAction, typeof settings> = {
  id: "chinese-checkers-full",
  title: "Chinese Checkers (Full 6-Player)",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description:
    "Hop your 10 pegs across the star into the opposite point — chain jumps, six players, classic format.",
  howToPlay:
    "Chinese Checkers (Full 6-Player) is the classic six-point star race played on the standard 121-cell board. You control the Red point at the top, and five colored CPU opponents fill the other five points. Each player starts with 10 pegs in their home triangle. Your goal: be the first to move all 10 of your pegs into the directly opposite star point.\n\nOn your turn, click one of your red pegs to select it. Highlighted yellow cells show every place that peg can legally reach in one turn. There are two kinds of moves:\n\n1) STEP: slide your peg to any of its six (up to six) adjacent empty cells.\n2) JUMP: leap directly over a single adjacent peg — yours, a CPU's, anyone's — into the empty cell on the opposite side. After a jump you may keep jumping with the same peg in any direction, forming long chains. All chain landings are highlighted at once, so just click your final destination.\n\nThe Move Mode setting picks between classic Jump-or-step play (default) and a faster Jump-only variant that disallows plain one-cell slides. The five CPU opponents use a 'longest-progress jump' heuristic — they always favor the move that drives a peg the furthest toward their own opposite point.\n\nWinning the game scores 100 points. If a CPU wins first, you still earn 1 point per peg already parked in your goal triangle. Set up long jump chains, build bridges with your own pegs, and don't leave stragglers in your home corner.",
  settings,
  initialState: (seed: number, s: S) =>
    initialState(seed, { moveMode: s.mode } as CCFSettings),
  reducer,
  isTerminal,
  hint: (state: CCFState): HintTarget | null => {
    if (isTerminal(state) !== null) return null;
    if (state.turn !== 0) return { selector: '[data-testid="ccf-status"]', pulses: 3 };
    return { selector: '[data-testid="ccf-board"]', pulses: 3 };
  },
  component: ChineseCheckersFullGame,
};
