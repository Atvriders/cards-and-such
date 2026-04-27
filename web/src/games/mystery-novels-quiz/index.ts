import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { MysteryNovelsQuizState, MysteryNovelsQuizAction, MysteryNovelsQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { MysteryNovelsQuizGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10","20","30"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const mysteryNovelsQuizPlugin: GamePlugin<MysteryNovelsQuizState, MysteryNovelsQuizAction, typeof settings> = {
  id:"mystery-novels-quiz", title:"Mystery Novels Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Christie, Doyle, Chandler, King, and the giants of detective fiction.",
  howToPlay:`Mystery Novels Quiz tests your knowledge of detective fiction, thrillers, crime, and horror — from Sherlock Holmes and Hercule Poirot to Lisbeth Salander and Harry Bosch.\n\nQuestions cover the Golden Age of British mystery (Christie, Sayers, Allingham, Marsh), American hardboiled (Hammett, Chandler, Macdonald, Cain), modern thrillers (Connelly, Patterson, Grafton, Paretsky), Stephen King's horror catalog (Carrie, It, The Shining, Misery), and Scandinavian noir (Larsson, Mankell, Nesbo).\n\nYou will be tested on iconic detectives — Holmes and his Baker Street address, Miss Marple, Father Brown, Lord Peter Wimsey, Adam Dalgliesh, Inspector Morse, Rebus — and the writers who created them.\n\nEach question has 15 seconds. Correct answers earn 100 points plus 10 per second remaining. Choose 10, 20, or 30 questions in Settings.\n\nIf you can name three Wallanders or distinguish Lew Archer from Sam Spade, you are ready. Game on, sleuth!`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as MysteryNovelsQuizSettings),
  reducer,isTerminal,component:MysteryNovelsQuizGame,
};
