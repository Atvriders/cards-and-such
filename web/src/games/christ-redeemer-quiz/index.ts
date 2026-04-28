import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { ChristRedeemerQuizState, ChristRedeemerQuizAction, ChristRedeemerQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { ChristRedeemerQuizGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10","20"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const christRedeemerQuizPlugin: GamePlugin<ChristRedeemerQuizState, ChristRedeemerQuizAction, typeof settings> = {
  id:"christ-redeemer-quiz", title:"Christ the Redeemer Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Test your knowledge of Brazil's iconic Christ the Redeemer statue.",
  howToPlay:`Christ the Redeemer Quiz tests your knowledge of one of the most recognizable religious monuments in the world. Questions cover the iconic statue completed in 1931 atop the 700m Corcovado mountain in Tijuca Forest National Park, overlooking Rio de Janeiro, Brazil. You'll be quizzed on the engineer Heitor da Silva Costa, the French sculptor Paul Landowski, and the 9-year construction process.

Topics include the statue's reinforced concrete structure with soapstone outer cladding, the 30m height (38m with pedestal), the 28m arm span, and the ~635-ton total mass. The Corcovado Railway used to transport the materials gets a question. The statue's status as a Catholic Christian symbol, its inclusion as a New Seven Wonder of the World in 2007, and its frequent lightning strikes (it has a built-in protection system) all come up. Visitor numbers approach 2 million annually.

You have 15 seconds per question. Correct answers earn 100 base points plus 10 per second remaining; wrong answers earn nothing.

Choose 10 or 20 questions in Settings. Embrace the wonder!`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as ChristRedeemerQuizSettings),
  reducer,isTerminal,component:ChristRedeemerQuizGame,
};
