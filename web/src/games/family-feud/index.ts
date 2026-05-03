import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { FamilyFeudState, FamilyFeudAction, FamilyFeudSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { FamilyFeud } from "./Game.js";

const settings = {
  questions: {
    kind: "enum" as const,
    label: "Questions",
    options: ["10", "15", "20"] as const,
    default: "10" as const,
  },
} as const;

export const familyFeudPlugin: GamePlugin<FamilyFeudState, FamilyFeudAction, typeof settings> = {
  id: "family-feud",
  title: "Family Feud",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Guess the most popular survey answers. Reveal all 5 slots before striking out 3 times.",
  howToPlay: `Survey Says is a word-guessing game based on popular opinion. Each round you are shown a survey-style question such as "Name something found in a kitchen." The board displays five hidden answer slots, each worth a different point value: 10, 8, 5, 3, and 2 points from most popular to least.

Type any answer you think appeared on the survey and press Guess (or Enter). If your answer matches one of the hidden slots, it is revealed and you earn the points for that slot. Correct answers use flexible matching — you do not need to spell it perfectly as long as the core word is right.

If your guess is not on the board, you receive a strike. You get three strikes per round. After the third strike, the round ends and any unrevealed answers are shown. If you reveal all five slots before striking out, you clear the board and all points are yours.

After each round, a summary shows which answers you found and which you missed. Click Next Question to move on. The game runs for 10, 15, or 20 questions depending on your settings.

Strategy: start with the most obvious answers (they tend to be worth more points) and work toward the obscure ones. Duplicate answers are flagged so you do not waste a guess. Your final score is the total points earned across all rounds — a perfect game of 10 questions scores 280 points.`,
  settings,
  initialState: (seed: number, s: FamilyFeudSettings) => initialState(seed, s),
  reducer,
  isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "done" || p === "gameover" || p === "ended" || p === "finished" || (s as any).gameOver || (s as any).won || (s as any).complete || (s as any).isComplete) return null; return { selector: ".ff-btn", pulses: 3 }; },
  component: FamilyFeud,
} as unknown as GamePlugin;
