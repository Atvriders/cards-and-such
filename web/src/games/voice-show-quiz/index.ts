import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { VoiceShowQuizState, VoiceShowQuizAction, VoiceShowQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { VoiceShowQuizGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10","20","30"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const voiceShowQuizPlugin: GamePlugin<VoiceShowQuizState, VoiceShowQuizAction, typeof settings> = {
  id:"voice-show-quiz", title:"The Voice Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Test your knowledge of The Voice TV show coaches, contestants, and history.",
  howToPlay:"The Voice Quiz tests your knowledge of NBC's hit singing competition. Questions cover the rotating chair-spinners — Blake Shelton, Adam Levine, Christina Aguilera, CeeLo Green, and many more — along with breakout winners, blind audition surprises, and the show's signature gimmicks.\n\nYou have 15 seconds per question. Each correct answer awards 100 base points plus 10 points for every second remaining on the clock — answer quickly to maximize your score. Wrong answers earn nothing.\n\nTap a choice, then press Submit. Correct answers glow green, wrong ones turn red, and the right answer is always revealed before you continue. Press Next to move on.\n\nChoose 10, 20, or 30 questions in Settings. Will you win this Battle Round? Hit Submit and turn your chair around!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as VoiceShowQuizSettings),
  reducer,isTerminal,component:VoiceShowQuizGame,
};
