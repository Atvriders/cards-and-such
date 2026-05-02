import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { IcyTowerArcadeState, IcyTowerArcadeAction, IcyTowerArcadeSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { IcyTowerArcadeGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const icyTowerArcadePlugin: GamePlugin<IcyTowerArcadeState, IcyTowerArcadeAction, typeof settings> = {
  id:"icy-tower-arcade", title:"Icy Tower-Style", category:"arcade",
  players:{ min:1, max:1, multiplayer:false },
  description:"Trivia about Icy Tower-style chain-jumping vertical jumpers.",
  howToPlay:"Icy Tower-Style Trivia is a ten-question quiz about Icy Tower (Free Lunch Design, 2001) and similar chain-jumping endless vertical jumpers. The protagonist (originally Harold the homeboy) starts climbing an icy tower of platforms, jumping floor-by-floor. Missing too long causes the bottom of the screen to catch up and end the game. Skipping multiple floors in a single jump triggers combo bonuses. Each question tests history and mechanics of Icy Tower. Tap an answer and Submit; correct answers earn 100 base points plus 10 per second remaining on the 15-second timer. Wrong answers reveal the correct option. After ten questions your final score is shown. Icy Tower's combo system birthed a whole platforming subgenre.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as IcyTowerArcadeSettings),
  reducer,isTerminal,hint: (state: IcyTowerArcadeState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-icy-tower-arcade-primary"]', pulses: 3 } : null,component:IcyTowerArcadeGame,
};
