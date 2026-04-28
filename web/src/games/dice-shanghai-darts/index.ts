import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { DiceShanghaiDartsState, DiceShanghaiDartsAction, DiceShanghaiDartsSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { DiceShanghaiDartsGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const diceShanghaiDartsPlugin: GamePlugin<DiceShanghaiDartsState, DiceShanghaiDartsAction, typeof settings> = {
  id:"dice-shanghai-darts", title:"Dice Shanghai Darts", category:"dice",
  players:{ min:1, max:1, multiplayer:false },
  description:"Hit single, double, triple of each number.",
  howToPlay:"Dice Shanghai is the classic darts side-game where you must hit a single, a double, and a triple of every number 1 through 20. Achieving all three on the same number in a single visit is called a 'Shanghai' and traditionally wins the leg outright.\n\nIn this mini you Roll three dice each of 20 rounds. Each die represents a dart: dice value 1-2 = single (1 point), 3-4 = double (2 points), 5-6 = triple (3 points). Your round score is the sum of those values. If you hit single, double and triple in the same round, you score a Shanghai bonus of +10.\n\nMost games total 60 to 80; rare runs over 100 indicate frequent Shanghai bonuses. The real game's tactical edge — choosing which sector to aim at — is replaced here by random dice, but the satisfaction of hitting a Shanghai bonus remains. Press Roll, Next. Quick, classic, and full of darts flavour.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as DiceShanghaiDartsSettings),
  reducer,isTerminal,component:DiceShanghaiDartsGame,
};
