import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { RenjuState, RenjuAction, RenjuSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { RenjuGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const renjuClassicPlugin: GamePlugin<RenjuState, RenjuAction, typeof settings> = {
  id:"renju", title:"Renju (Five-in-a-row)", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Gomoku with forbidden-move rules to balance the first player.",
  howToPlay:"Renju (Five-in-a-row) is a fast-paced quiz built around the rules, history, and tactical themes of Renju (Five-in-a-row). Each question describes a position, a rule, or a strategic choice unique to this variant, and asks you to pick the right answer from four choices.\n\nYou have 15 seconds per question. A correct answer awards 100 base points plus 10 points for every second remaining on the clock — so think fast and decide. Wrong answers and timeouts score zero, but the correct choice is always revealed before you continue, turning every miss into a learning moment.\n\nTap a choice to select it, then press Submit. Selected choices glow blue, correct answers turn green, and wrong picks turn red. Press Next to continue to the next question. After ten questions you'll see your final score and how many you nailed.\n\nWhether you've never played this variant or you've studied it for years, the quiz mixes flavor questions, rule trivia, and tactical motifs that capture what makes this version of chess unique.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as RenjuSettings),
  reducer,isTerminal,hint: (state: RenjuState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-renju-answer-0"]', pulses: 3 } : null, component:RenjuGame,
};
