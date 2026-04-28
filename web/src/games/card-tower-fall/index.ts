import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { CardTowerFallState, CardTowerFallAction, CardTowerFallSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { CardTowerFallGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const cardTowerFallPlugin: GamePlugin<CardTowerFallState, CardTowerFallAction, typeof settings> = {
  id:"card-tower-fall", title:"Card Tower Fall", category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Build a tower; each Stack adds points but risks collapse. Bank to lock in.",
  howToPlay:"Card Tower Fall is a press-your-luck tower builder over 10 rounds. Each round you choose Stack to risk adding the next card's rank value (2-10 face value, J=11, Q=12, K=13, A=14) to your tower, or Bank to lock in your current tower height as 5 points × tower height.\n\nBut there's a catch: drawing an Ace on a Stack collapses the entire tower instantly, voiding any unbanked points and resetting tower height to 0 for the rest of the game. Banking guarantees points but ends tower growth for that game.\n\nThe riskiest play is to Stack as many high cards as possible, then Bank before an Ace strikes. A typical bank lands 40-100 points; a brave 5-stack run can hit 200+ if Ace dodges you.\n\nManage risk, watch the deck, and decide: lift the tower higher or lock it in? Card Tower Fall makes every round a tactical thrill.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as CardTowerFallSettings),
  reducer,isTerminal,component:CardTowerFallGame,
};
