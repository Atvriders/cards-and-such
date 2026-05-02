import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { BobsledQuizState, BobsledQuizAction, BobsledQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { BobsledQuizGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10","20"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const bobsledQuizPlugin: GamePlugin<BobsledQuizState, BobsledQuizAction, typeof settings> = {
  id:"bobsled-quiz", title:"Bobsled Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Test your knowledge of bobsled history, tracks, and Olympic moments.",
  howToPlay:`Bobsled Quiz tests your knowledge of one of the most thrilling Winter Olympic sports. Questions cover the sport's Swiss origins, its 1924 Olympic debut at Chamonix, and key technical details like track length, vertical drop, and average speeds (well over 120 km/h on the fastest runs).

You'll be quizzed on the iconic 1988 Jamaican bobsled team that inspired Cool Runnings, the dominant German bobsled program, and the related sports of luge and skeleton. Topics include 2-man and 4-man events, the introduction of women's bobsled in 2002, the monobob (women's solo) at Beijing 2022, and pioneers like Steven Holcomb.

You have 15 seconds per question. Correct answers earn 100 base points plus 10 per second remaining on the timer; wrong answers earn nothing. Tap a choice and press Submit; correct answers glow green, the right answer is always revealed before you continue.

Choose 10 or 20 questions in Settings. Feel the need for speed!`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as BobsledQuizSettings),
  reducer,isTerminal,
  hint: (state: BobsledQuizState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component:BobsledQuizGame,
};
