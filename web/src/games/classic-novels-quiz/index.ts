import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { ClassicNovelsQuizState, ClassicNovelsQuizAction, ClassicNovelsQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { ClassicNovelsQuizGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10","20","30"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const classicNovelsQuizPlugin: GamePlugin<ClassicNovelsQuizState, ClassicNovelsQuizAction, typeof settings> = {
  id:"classic-novels-quiz", title:"Classic Novels Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Austen, Dickens, Tolstoy, the Brontes, and the great novelists.",
  howToPlay:`Classic Novels Quiz drills you on the foundational works of Western literature. From Jane Austen's drawing-room comedies (Pride and Prejudice, Emma) to Tolstoy's sweeping epics (War and Peace, Anna Karenina) and Dickens's London panoramas (Great Expectations, Bleak House), this quiz spans the 19th-century giants.\n\nYou will be tested on iconic openings, lead characters, settings, and authors of works by the Brontes (Wuthering Heights, Jane Eyre), Hugo (Les Miserables), Flaubert (Madame Bovary), Cervantes (Don Quixote), Melville (Moby-Dick), and Dostoevsky (Crime and Punishment, The Brothers Karamazov).\n\nEach question has a 15-second timer. Correct answers earn 100 base points plus 10 per second remaining on the clock. Choose 10, 20, or 30 questions in Settings.\n\nFor anyone who took a Lit 101 class — or just genuinely loves the great novels — this quiz is your literary playground. Good luck!`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as ClassicNovelsQuizSettings),
  reducer,isTerminal,component:ClassicNovelsQuizGame,
};
