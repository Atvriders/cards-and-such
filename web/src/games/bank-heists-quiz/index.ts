import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { BankHeistsQuizState, BankHeistsQuizAction, BankHeistsQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { BankHeistsQuizGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10","20"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const bankHeistsQuizPlugin: GamePlugin<BankHeistsQuizState, BankHeistsQuizAction, typeof settings> = {
  id:"bank-heists-quiz", title:"Famous Bank Heists Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Test your knowledge of famous bank heists.",
  howToPlay:"Famous Bank Heists Quiz tests your knowledge of the biggest, boldest, and bloodiest bank robberies in history. From Butch Cassidy and the Wild Bunch through the British Bank of the Middle East job, the Banco Central Brazil tunnel heist, and modern stunts like Northern Bank in Belfast and the Antwerp Diamond Center.\n\nQuestions cover famous robbers, the tools and methods used (tunnels, hostages, distraction, insider help), the haul amounts, the aftermaths, the law enforcement responses, and the cultural impact in films like Heat, Inside Man, and The Bank Job.\n\nYou have 15 seconds per question. Each correct answer awards 100 base points plus 10 points for every second remaining on the clock — answer quickly. Wrong answers earn zero. Tap a choice, then press Submit. Correct answers glow green, wrong ones turn red, and the right answer is always revealed before you continue. Choose 10 or 20 questions in Settings.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as BankHeistsQuizSettings),
  reducer,isTerminal,component:BankHeistsQuizGame,
};
