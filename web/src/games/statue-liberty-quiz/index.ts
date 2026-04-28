import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { StatueLibertyQuizState, StatueLibertyQuizAction, StatueLibertyQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { StatueLibertyQuizGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10","20"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const statueLibertyQuizPlugin: GamePlugin<StatueLibertyQuizState, StatueLibertyQuizAction, typeof settings> = {
  id:"statue-liberty-quiz", title:"Statue of Liberty Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Test your knowledge of the Statue of Liberty's history, design, and symbolism.",
  howToPlay:`Statue of Liberty Quiz tests your knowledge of one of the most iconic symbols of freedom in the world. Questions cover the statue's creation as a gift from France to the United States, dedicated in 1886 to celebrate American independence and Franco-American friendship. You'll be quizzed on the sculptor Frédéric Auguste Bartholdi, the engineer Gustave Eiffel (who designed the internal iron framework), and the colossal scale (height ~93m to torch tip).

Topics include the copper exterior that turned green from oxidation, the seven-pointed crown representing the seven seas and continents, the broken chain at her feet symbolizing freedom from oppression, and the tablet bearing the date July 4 1776 in Roman numerals. Emma Lazarus's famous poem 'The New Colossus' with its 'Give me your tired, your poor' line is at the pedestal. Ellis Island as a nearby immigration center comes up too.

You have 15 seconds per question. Correct answers earn 100 base points plus 10 per second remaining; wrong answers earn nothing.

Choose 10 or 20 questions in Settings. Liberty calls!`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as StatueLibertyQuizSettings),
  reducer,isTerminal,component:StatueLibertyQuizGame,
};
