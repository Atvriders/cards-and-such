import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { BreakingBadState, BreakingBadAction, BreakingBadSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { BreakingBadQuizGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10","20","30"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const breakingBadQuizPlugin: GamePlugin<BreakingBadState, BreakingBadAction, typeof settings> = {
  id:"breaking-bad-quiz", title:"Breaking Bad Quiz", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Test your knowledge of Breaking Bad: Walter White's descent into the meth trade.",
  howToPlay:"Breaking Bad Quiz tests your knowledge of Vince Gilligan's acclaimed AMC drama about Walter White, a chemistry teacher turned methamphetamine kingpin. Questions cover all five seasons set in Albuquerque, New Mexico — Walter, Jesse, Skyler, Walt Jr., Hank, Marie, Saul, Mike, Gus Fring, the Salamancas, and the wider cartel underworld.\n\nYou have 15 seconds per question. Each correct answer awards 100 base points plus 10 points for every second remaining on the clock. Wrong answers earn nothing.\n\nTap a choice, then press Submit. Correct answers glow green, wrong ones turn red.\n\nChoose 10, 20, or 30 questions in Settings. I am the one who knocks — and the one who scores!",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as BreakingBadSettings),
  reducer,isTerminal,component:BreakingBadQuizGame,
};
