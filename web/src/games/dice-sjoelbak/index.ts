import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { DiceSjoelbakState, DiceSjoelbakAction, DiceSjoelbakSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { DiceSjoelbakGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const diceSjoelbakPlugin: GamePlugin<DiceSjoelbakState, DiceSjoelbakAction, typeof settings> = {
  id:"dice-sjoelbak", title:"Dice Sjoelbak", category:"dice",
  players:{ min:1, max:1, multiplayer:false },
  description:"Dutch table shuffleboard; 3 rounds, 30 dice.",
  howToPlay:"Dice Sjoelbak simulates the Dutch wooden-table shuffleboard game where players slide flat wooden pucks down a long lane, trying to land them in four numbered scoring boxes (1, 2, 3, 4 points). The trick is that completing a row across all four boxes earns bonus points.\n\nEach of 10 rounds you Roll three dice. Each die value 1-4 represents a box landing (1=box1, 2=box2, etc.); 5 and 6 are misses. If all four box values appear at least once across the three rolls (impossible in one round but tracked across rounds), bonus +5 every fifth round.\n\nA typical round scores 4-7 points; ten rounds totalling 40-65 is a normal game; absolute max with all 4s is 120.\n\nReal sjoelbak is a Dutch family Christmas staple, played at home and in cafes. The 30-puck game length, named-box scoring and folding lane are unmistakably Netherlands. This mini compresses puck slides into dice. Press Roll, Next. Quick, low-friction, and distinctively Dutch.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as DiceSjoelbakSettings),
  reducer,isTerminal,component:DiceSjoelbakGame,
};
