import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { ElvisQuizState, ElvisQuizAction, ElvisQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { ElvisQuizGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10","20","30"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const elvisQuizPlugin: GamePlugin<ElvisQuizState, ElvisQuizAction, typeof settings> = {
  id:"elvis-quiz", title:"Elvis Presley Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Test your knowledge of the King of Rock and Roll.",
  howToPlay:`Elvis Presley Quiz puts your knowledge of the King to the test. From his birth in Tupelo, Mississippi through Sun Records, the Army years, the Vegas residency, and his early death at Graceland, you'll be quizzed on songs, films, family, and the iconic moments that made Elvis a global phenomenon. Expect 'Heartbreak Hotel', 'Hound Dog', 'Jailhouse Rock', and 'Suspicious Minds', alongside questions about Priscilla, Colonel Tom Parker, and the '68 Comeback Special.\n\nYou have 15 seconds per question. Each correct answer earns 100 base points plus 10 points for every second remaining on the clock — answer quickly to maximize your score. Wrong answers earn nothing.\n\nTap a choice, then press Submit. Correct answers glow green, wrong ones turn red, and the correct answer is always revealed before you continue. Press Next to advance.\n\nChoose 10, 20, or 30 questions in Settings. Thank you, thank you very much!`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as ElvisQuizSettings),
  reducer,isTerminal,component:ElvisQuizGame,
};
