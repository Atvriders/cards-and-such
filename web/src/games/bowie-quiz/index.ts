import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { BowieQuizState, BowieQuizAction, BowieQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { BowieQuizGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10","20","30"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const bowieQuizPlugin: GamePlugin<BowieQuizState, BowieQuizAction, typeof settings> = {
  id:"bowie-quiz", title:"David Bowie Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Test your knowledge of David Bowie — Ziggy Stardust, the Thin White Duke, and beyond.",
  howToPlay:`David Bowie Quiz tests your knowledge of one of music's most reinventive icons. From his early hit 'Space Oddity' through the alien glam-rock persona of Ziggy Stardust, the Berlin trilogy with Brian Eno, the chart-topping 'Let's Dance' era, and his haunting final album 'Blackstar', you'll be quizzed on songs, alter egos, collaborators, films, and the moments that defined his ever-shifting career.\n\nYou have 15 seconds per question. Each correct answer earns 100 base points plus 10 points for every second remaining on the clock — answer quickly to maximize your score. Wrong answers earn nothing.\n\nTap a choice, then press Submit. Correct answers glow green, wrong ones turn red, and the correct answer is always revealed before you continue. Press Next to advance.\n\nChoose 10, 20, or 30 questions in Settings. Ground control to Major Tom!`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as BowieQuizSettings),
  reducer,isTerminal,
  hint: (state: BowieQuizState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component:BowieQuizGame,
};
