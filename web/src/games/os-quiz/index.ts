import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { OsQuizState, OsQuizAction, OsQuizSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { OsQuizGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10","20","30"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const osQuizPlugin: GamePlugin<OsQuizState, OsQuizAction, typeof settings> = {
  id:"os-quiz", title:"Operating Systems Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Test your knowledge of Unix, Linux, Windows, and macOS history.",
  howToPlay:"Operating Systems Quiz challenges you on the world of OSes: Unix's pioneering design, the Linux ecosystem, Windows from DOS to today, macOS and its NeXT/Mach roots, mobile OSes, and the concepts behind kernels, schedulers, and file systems. Test your knowledge of distros, command-line legends, and the people behind the OSes we use every day.\n\nYou have 15 seconds per question. Each correct answer awards 100 base points plus 10 points for every second remaining on the clock \u2014 fast, accurate answers earn the highest score. Wrong answers earn nothing.\n\nTap a choice, then press Submit. Correct answers glow green, wrong ones turn red, and the right answer is always revealed before you continue. Press Next to move on.\n\nChoose 10, 20, or 30 questions in Settings. Whether you're a Linux power user, a Windows admin, or a Mac fan, this quiz will deepen your appreciation for the platforms that run our digital lives!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as OsQuizSettings),
  reducer,isTerminal,
  hint: (state: OsQuizState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-quiz-answer-0"]', pulses: 3 } : null,
  component:OsQuizGame,
};
