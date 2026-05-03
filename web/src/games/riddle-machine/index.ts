import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { RiddleState, RiddleAction, RiddleSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { RiddleMachineGame } from "./Game.js";

const settings = {} as const;

export const riddleMachinePlugin: GamePlugin<RiddleState, RiddleAction, typeof settings> = {
  id: "riddle-machine",
  title: "Riddle Machine",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "A collection of classic riddles, lateral thinking puzzles, wordplay, and math traps. Can you outsmart the machine?",
  howToPlay: `Riddle Machine is a collection of brain-teasing riddles spanning four categories: Classic Riddles, Math Puzzles, Wordplay, and Lateral Thinking.

Each round presents a riddle as a question with four possible answers. Read carefully — riddles are designed to mislead you with assumptions. Don't take the question too literally (or sometimes too loosely!). Think outside the box.

Select the answer you believe is correct, then press Submit Answer. After submitting, the correct answer is highlighted and a full explanation walks through the reasoning. Use this to sharpen your riddle-solving instincts.

Scoring rewards both accuracy and streaks: each correct answer earns 200 base points, plus a streak bonus of 50 points per consecutive correct answer. A 5-answer streak, for example, adds 250 bonus points. Wrong answers reset the streak to zero.

Riddles are shuffled randomly each game session, so no two playthroughs are the same. Work through as many as you like — the machine never runs out of riddles!

Lateral Thinking puzzles require you to question your assumptions about the question itself. Math traps look like arithmetic but often rely on reading the question carefully rather than doing calculations. Classic riddles use wordplay and metaphor.`,
  settings,
  initialState: (seed: number, s: RiddleSettings) => initialState(seed, s),
  reducer,
  isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "done" || p === "gameover" || p === "ended" || p === "finished" || (s as any).gameOver || (s as any).won || (s as any).complete || (s as any).isComplete) return null; return { selector: ".rm-submit-btn", pulses: 3 }; },
  component: RiddleMachineGame,
};
