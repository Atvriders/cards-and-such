import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { JustOneState, JustOneAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const JustOneGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.JustOneGame as unknown as React.ComponentType<unknown> })));
const settings = {} as const;

export const justOnePlugin: GamePlugin<JustOneState, JustOneAction, typeof settings> = {
  id: "just-one",
  title: "Just One",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Guess the secret word from bot clues — but duplicate clues get canceled!",
  howToPlay: `Just One is a cooperative word-guessing party game. You are the guesser and three bots are your helpers.

Each round a secret target word is chosen. The three bots each write a single-word clue related to that target. The twist: if any two bots write the SAME clue word, those duplicate clues are canceled and removed — you never see them! You must guess the secret word using only the remaining visible clues.

For example, if the target is OCEAN and the bots suggest SEA, FISH, and SEA — the two "SEA" clues cancel each other. You see only FISH and must deduce OCEAN.

Type your guess in the input field and press Enter or click Submit. Matching the target exactly (case-insensitive) scores 100 points for the round. A wrong guess scores 0. You play 5 rounds per game.

After submitting your guess you see the target word revealed, then advance to the next round.

Strategy: even with only one visible clue, use your deduction skills — a single word like TIDE or MARINE still points clearly to OCEAN. When all clues cancel, you must guess blind!

Maximum score: 500 (5 rounds × 100). Aim for 400+ for a great result.`,
  settings,
  initialState: (seed: number) => initialState(seed),
  reducer,
  isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "done" || p === "gameover" || p === "ended" || p === "finished" || (s as any).gameOver || (s as any).won || (s as any).complete || (s as any).isComplete) return null; return { selector: ".just-one-btn", pulses: 3 }; },
  component: JustOneGame,
};
