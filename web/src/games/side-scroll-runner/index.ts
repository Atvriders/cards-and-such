import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { SideScrollRunnerState, SideScrollRunnerAction, SideScrollRunnerSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { SideScrollRunnerGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const sideScrollRunnerPlugin: GamePlugin<SideScrollRunnerState, SideScrollRunnerAction, typeof settings> = {
  id:"side-scroll-runner", title:"Side-Scroll Runner", category:"arcade",
  players:{ min:1, max:1, multiplayer:false },
  description:"Trivia about classic side-scrolling endless runner games.",
  howToPlay:"Side-Scroll Runner Trivia is a ten-question quiz about endless side-scrolling runner games — that auto-runner genre popularized in the 2000s and 2010s by titles like Canabalt, Robot Unicorn Attack, Jetpack Joyride, and many mobile clones. The protagonist auto-runs left to right (or vice versa) and the player taps to jump, slide, or attack to dodge ever-faster obstacles. Score scales with distance run, and difficulty often ramps without end. Each question tests history, mechanics, and famous titles in the side-scroll runner subgenre. Tap an answer and Submit; correct answers earn 100 base points plus 10 per second remaining on the 15-second timer. Wrong answers reveal the correct option. After ten questions your final score is shown. Side-scroll runners turned a single button into hours of replay value.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as SideScrollRunnerSettings),
  reducer,isTerminal,hint: (state: SideScrollRunnerState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-side-scroll-runner-primary"]', pulses: 3 } : null,component:SideScrollRunnerGame,
};
