import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { ChemistryLabQuizState, ChemistryLabQuizAction, ChemistryLabQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { ChemistryLabQuizGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10","20","30"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const chemistryLabQuizPlugin: GamePlugin<ChemistryLabQuizState, ChemistryLabQuizAction, typeof settings> = {
  id:"chemistry-lab-quiz", title:"Chemistry Lab Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Test your knowledge of elements, reactions, and the laboratory.",
  howToPlay:"Chemistry Lab Quiz challenges you on the science of matter: elements and their properties, the periodic table, chemical formulas, acids and bases, lab techniques, and the great chemists who shaped the field. Questions cover everything from the basics \u2014 atomic structure, the pH scale, common compounds \u2014 to deeper topics like Avogadro's number, Mendeleev's periodic insights, and Marie Curie's pioneering work on radioactivity.\n\nYou have 15 seconds per question. Each correct answer awards 100 base points plus 10 points for every second remaining on the clock \u2014 quick thinking earns the highest score. Wrong answers earn nothing.\n\nTap a choice, then press Submit. Correct answers glow green, wrong ones turn red, and the right answer is always revealed before you continue. Press Next to move on.\n\nChoose 10, 20, or 30 questions in Settings. Whether you're a high-school student, a college chem major, or a curious mind, this quiz will sharpen your understanding of the elements that make up our world!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as ChemistryLabQuizSettings),
  reducer,isTerminal,component:ChemistryLabQuizGame,
};
