import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { KingOfHillChessState, KingOfHillChessAction, KingOfHillChessSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { KingOfHillChessGame } from "./Game.js";
const settings = { questions: { kind:"enum" as const, label:"Questions", options:["10"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const kingOfHillChessPlugin: GamePlugin<KingOfHillChessState, KingOfHillChessAction, typeof settings> = {
  id:"king-of-hill-chess", title:"King of the Hill Chess", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"First player to move king to central four squares wins.",
  howToPlay:"King of the Hill Chess is a fast-paced quiz built around the rules, history, and tactical themes of King of the Hill Chess. Each question describes a position, a rule, or a strategic choice unique to this variant, and asks you to pick the right answer from four choices.\n\nYou have 15 seconds per question. A correct answer awards 100 base points plus 10 points for every second remaining on the clock — so think fast and decide. Wrong answers and timeouts score zero, but the correct choice is always revealed before you continue, turning every miss into a learning moment.\n\nTap a choice to select it, then press Submit. Selected choices glow blue, correct answers turn green, and wrong picks turn red. Press Next to continue to the next question. After ten questions you'll see your final score and how many you nailed.\n\nWhether you've never played this variant or you've studied it for years, the quiz mixes flavor questions, rule trivia, and tactical motifs that capture what makes this version of chess unique.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as KingOfHillChessSettings),
  reducer,isTerminal,component:KingOfHillChessGame,
};
