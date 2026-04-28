import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { PalmeDorQuizState, PalmeDorQuizAction, PalmeDorQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { PalmeDorQuizGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10","20"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const palmeDorQuizPlugin: GamePlugin<PalmeDorQuizState, PalmeDorQuizAction, typeof settings> = {
  id:"palme-dor-quiz", title:"Palme d'Or Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Test your knowledge of Cannes' Palme d'Or.",
  howToPlay:"Palme d'Or Quiz tests your knowledge of the Cannes Film Festival's top award. From its first year (then Grand Prix) in 1939's canceled edition through 1955's first Palme to the modern award, the Palme has crowned cinema's bravest, strangest, and most lasting works.\n\nQuestions cover famous winners — La Dolce Vita, Apocalypse Now, Pulp Fiction, Dancer in the Dark, The Pianist, 4 Months 3 Weeks 2 Days, The Tree of Life, Amour, Blue Is the Warmest Colour, Parasite, Triangle of Sadness, Anatomy of a Fall — directors with multiple Palmes (Loach, Haneke, Coppola, Bille August, the Dardennes, Imamura, Schlöndorff), the gold leaf design, and key juries.\n\nYou have 15 seconds per question. Each correct answer awards 100 base points plus 10 points for every second remaining on the clock — answer quickly. Wrong answers earn zero. Choose 10 or 20 questions in Settings.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as PalmeDorQuizSettings),
  reducer,isTerminal,component:PalmeDorQuizGame,
};
