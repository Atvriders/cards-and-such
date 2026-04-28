import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { CiaQuizState, CiaQuizAction, CiaQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { CiaQuizGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10","20"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const ciaQuizPlugin: GamePlugin<CiaQuizState, CiaQuizAction, typeof settings> = {
  id:"cia-quiz", title:"CIA History Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Test your knowledge of the Central Intelligence Agency.",
  howToPlay:"CIA History Quiz tests your knowledge of the Central Intelligence Agency: its founding under the National Security Act of 1947, its directors, its famous operations, and its public scandals.\n\nQuestions cover topics from the OSS roots and Allen Dulles era, through Bay of Pigs, Phoenix Program, Iran-Contra and post-9/11 counterterrorism, plus headquarters at Langley, the National Clandestine Service, and the agency's evolving relationship with Congress.\n\nYou have 15 seconds per question. Each correct answer awards 100 base points plus 10 points for every second remaining on the clock. Wrong answers earn nothing. Tap a choice, then press Submit. Correct answers glow green, wrong ones turn red, and the right answer is always revealed before you continue. Press Next to move on.\n\nChoose 10 or 20 questions in Settings. Whether you're a Tom Clancy fan or a serious student of espionage, this quiz will challenge what you think you know about America's premier intelligence agency.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as CiaQuizSettings),
  reducer,isTerminal,component:CiaQuizGame,
};
