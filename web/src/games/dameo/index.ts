import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { DameoState, DameoAction, DameoSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { DameoGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const dameoPlugin: GamePlugin<DameoState, DameoAction, typeof settings> = {
  id:"dameo", title:"Dameo", category:"board",
  players:{ min:1, max:1, multiplayer:false },
  description:"Christian Freeling design blending draughts variants. Place vs CPU; most pieces wins.",
  howToPlay:"Dameo is a 2000 Christian Freeling design that blends elements of multiple Draughts variants — featuring rapid linear movement and forced captures on a checkered board. This compact 5×5 version reframes the gameplay as a placement contest.\n\nYou and a random CPU alternate placing pieces on empty cells. Click any empty cell to place. The CPU then places randomly. After 16 moves or when the board fills, the player with the most pieces on the board wins.\n\n100 points for a win, 25 for a draw, 0 for a loss. Since both sides place equal counts under the move cap, the game has natural draw tendencies — but the CPU's random play often gives you tactical openings to leverage.\n\nThis simplified Dameo captures the strategic elegance of the original through pure placement. For the full Dameo experience with linear movement and chained captures, this is just a taste — a delicious one nonetheless.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as DameoSettings),
  reducer,isTerminal,component:DameoGame,
};
