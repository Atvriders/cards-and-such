import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { EuropeanCitiesQuizState, EuropeanCitiesQuizAction, EuropeanCitiesQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { EuropeanCitiesQuizGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10","20","30"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const europeanCitiesQuizPlugin: GamePlugin<EuropeanCitiesQuizState, EuropeanCitiesQuizAction, typeof settings> = {
  id:"european-cities-quiz", title:"European Cities Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Match European cities to their countries — from Reykjavik to Tirana.",
  howToPlay:`European Cities Quiz tests your familiarity with Europe's capitals and major cities. From the storybook streets of Prague to the saunas of Helsinki and the cathedrals of Sofia, you will face four-option questions covering all of Europe's nations.\n\nEach question gives you 15 seconds. Correct answers earn 100 base points plus a 10-point speed bonus per second remaining on the clock. Wrong answers earn nothing, but you do see the right answer revealed before moving on.\n\nQuestions span Western, Northern, Southern, and Eastern Europe — including the Baltic trio, the Balkans, the Iberian peninsula, and the tiny microstates like Andorra, Liechtenstein, and Monaco.\n\nChoose 10, 20, or 30 questions. If you can keep Riga, Vilnius, and Tallinn straight, you are doing better than most travelers. Sharpen your map skills before that next Eurail trip!`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as EuropeanCitiesQuizSettings),
  reducer,isTerminal,component:EuropeanCitiesQuizGame,
};
