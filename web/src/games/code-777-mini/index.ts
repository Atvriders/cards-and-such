import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { Code777MiniState, Code777MiniAction, Code777MiniSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { Code777MiniGame } from "./Game.js";

const settings = {
  questions: { kind: "enum" as const, label: "Questions", options: ["10"] as const, default: "10" as const },
} as const;
type S = SettingsOf<typeof settings>;

export const code777MiniPlugin: GamePlugin<Code777MiniState, Code777MiniAction, typeof settings> = {
  id: "code-777-mini",
  title: "Code 777 Quiz",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: `10 questions on Robert Abbott's number-deduction classic Code 777.`,
  howToPlay: `Code 777 Strategy Quiz tests your knowledge of Robert Abbott's 1985 deduction puzzle game. Each player wears three numbered tiles facing outward — players see everyone else's tiles but not their own. By reading public clue cards, you deduce your own three numbers.

Across 10 multiple-choice questions you'll cover: tile distribution, why public clues describe partial info ("more than two reds total"), the timing of clue reveals, and why patient note-taking is essential.

Each correct answer awards 100 points (1000 max).

Tips: in real Code 777 the clue cards are deliberately ambiguous — never assume the strongest interpretation. Track each clue's effect on your hypothesis space and prefer clues that distinguish between two close hypotheses. A common error is forgetting that clue counts include the asking player's hidden tiles (which you can't see).`,
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as Code777MiniSettings),
  reducer,
  isTerminal,
  component: Code777MiniGame,
};
