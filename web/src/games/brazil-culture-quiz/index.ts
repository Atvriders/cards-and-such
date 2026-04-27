import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { BrazilCultureQuizState, BrazilCultureQuizAction, BrazilCultureQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { BrazilCultureQuizGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10","20"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const brazilCultureQuizPlugin: GamePlugin<BrazilCultureQuizState, BrazilCultureQuizAction, typeof settings> = {
  id:"brazil-culture-quiz", title:"Brazil Culture Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Brazilian culture: samba, football, food, and festivals.",
  howToPlay:"Brazil Culture Quiz tests your knowledge of South America's largest nation. Questions span samba and bossa nova rhythms, the world-famous Carnaval in Rio, capoeira's African origins, the Amazon rainforest, regional cuisines including feijoada and acarajé, the Portuguese colonization and slavery legacy, the imperial era under Pedro I and II, the proclamation of the republic, modern politics, and football legends from Pelé to Neymar.\n\nYou have 15 seconds per question. Correct answers earn 100 base points plus 10 per second remaining. Wrong answers earn zero but reveal the answer.\n\nTap a choice and press Submit. Green means correct, red means wrong. Press Next to advance.\n\nChoose 10 or 20 questions in Settings. Whether you've danced samba in Salvador, watched the Seleção lift a World Cup trophy, or sipped caipirinha on Copacabana, this quiz will challenge your Brazilian cultural knowledge.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as BrazilCultureQuizSettings),
  reducer,isTerminal,component:BrazilCultureQuizGame,
};
