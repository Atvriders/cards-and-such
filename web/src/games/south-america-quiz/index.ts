import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { SouthAmericaQuizState, SouthAmericaQuizAction, SouthAmericaQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { SouthAmericaQuizGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10","20","30"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const southAmericaQuizPlugin: GamePlugin<SouthAmericaQuizState, SouthAmericaQuizAction, typeof settings> = {
  id:"south-america-quiz", title:"South America Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Capitals, mountains, rivers, and natural wonders of South America.",
  howToPlay:`South America Quiz takes you across a continent of dramatic geography — the Andes mountain spine, the Amazon rainforest, Patagonian steppes, and the world's driest desert (the Atacama).\n\nQuestions cover capitals (Bogota, Lima, Quito), spectacular waterfalls (Iguazu, Salto del Angel), iconic peaks (Aconcagua, Huascaran), and famous sites like Machu Picchu, the Galapagos Islands, and Christ the Redeemer.\n\nYou will also find questions about the unique dual-capital arrangement of Bolivia, the long Pacific coastline of Chile, and the shared geography of Patagonia and Tierra del Fuego.\n\nEach question has a 15-second timer. Correct answers earn 100 base points plus a 10-point bonus per second remaining. Choose 10, 20, or 30 questions in Settings.\n\nFrom the equatorial jungle to the icy Drake Passage, this quiz spans the most geographically diverse continent on Earth. Vamos!`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as SouthAmericaQuizSettings),
  reducer,isTerminal,component:SouthAmericaQuizGame,
};
