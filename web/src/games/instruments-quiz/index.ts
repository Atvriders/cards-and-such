import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { InstrumentsQuizState, InstrumentsQuizAction, InstrumentsQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { InstrumentsQuiz } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10","20"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const instrumentsQuizPlugin: GamePlugin<InstrumentsQuizState, InstrumentsQuizAction, typeof settings> = {
  id:"instruments-quiz", title:"Instruments Quiz", category:"board",
  players:{min:1,max:1,multiplayer:false},
  description:"Test your musical instrument knowledge — families, origins, strings, and mechanics.",
  howToPlay:`Instruments Quiz explores the rich world of musical instruments from around the globe. Questions cover instrument families (strings, brass, woodwind, percussion), physical properties, origins, and fun facts about how each instrument produces sound.

Select one of four answers and press Submit. Each correct answer earns 100 points. The correct answer is revealed after each question so you can build your music theory and organology knowledge.

Instruments featured include: violin, guitar, piano, clarinet, tuba, harp, sitar, xylophone, accordion, didgeridoo, banjo, trombone, oboe, timpani, shakuhachi, koto, and many more from Western and world music traditions.

Use Settings to choose 10 or 20 questions. Questions are randomly drawn and answer choices are shuffled each game. Whether you play an instrument, love music, or are just curious about how sounds are made, this quiz offers something to discover with every question!`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as InstrumentsQuizSettings),
  reducer, isTerminal, component:InstrumentsQuiz,
};
