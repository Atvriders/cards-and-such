import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { CharadesClassicQuizState, CharadesClassicQuizAction, CharadesClassicQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { CharadesClassicQuizGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const charadesClassicQuizPlugin: GamePlugin<CharadesClassicQuizState, CharadesClassicQuizAction, typeof settings> = {
  id:"charades-classic-quiz", title:"Charades Trivia", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Trivia about classic Charades — the silent team-acting parlour game.",
  howToPlay:"Charades Trivia tests your knowledge of the classic team acting game where players silently mime film titles, books, plays, songs, or famous people while teammates shout guesses against the clock. Across ten questions you'll cover Charades' history, signal conventions, the standard categories, syllable counting gestures, the indication for 'sounds like', and rules for both casual and tournament play. Select the answer you believe is correct and press Submit; a right answer awards 100 base points plus 10 per second remaining on the 15-second timer, so speed pays. A wrong answer reveals the correct option and locks the round so you can press Next. After ten questions your final score is displayed. Charades has roots in 18th-century French parlour entertainment and survives today thanks to its joyful chaos and its perfect ratio of effort to laughter — see how much of its rich tradition you can summon without saying a word.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as CharadesClassicQuizSettings),
  reducer,isTerminal,component:CharadesClassicQuizGame,
};
