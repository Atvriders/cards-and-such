import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { MathematiciansState, MathematiciansAction, MathematiciansSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { MathematiciansQuiz } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10","20","30"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const mathematiciansQuizPlugin: GamePlugin<MathematiciansState, MathematiciansAction, typeof settings> = {
  id: "mathematicians-quiz", title: "Mathematicians Quiz", category: "board",
  players: { min:1, max:1, multiplayer:false },
  description: "Test your knowledge of history's greatest mathematicians — from Euclid and Gauss to Ramanujan and Gödel.",
  howToPlay: `Mathematicians Quiz takes you through the lives and discoveries of the greatest mathematical minds in history. Questions cover famous theorems, inventions, biographical facts, and the fields of mathematics each person revolutionized.

You have 15 seconds per question. A correct answer earns 100 base points plus a speed bonus of 10 points per second remaining on the clock. Answer quickly for maximum score.

Click your choice and press Submit. The correct answer highlights green; wrong selections turn red. Press Next to continue.

Settings let you choose 10, 20, or 30 questions from a pool of 30 items covering Euclid, Gauss, Euler, Ramanujan, Gödel, Galois, Emmy Noether, and many more legendary figures.

From ancient Greek geometry to 20th-century abstract algebra, Mathematicians Quiz celebrates the elegance and power of pure reasoning!`,
  settings,
  initialState: (seed:number, s:S) => initialState(seed, s as MathematiciansSettings),
  reducer, isTerminal, component: MathematiciansQuiz,
};
