import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { DiceFoosballState, DiceFoosballAction, DiceFoosballSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { DiceFoosballGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const diceFoosballPlugin: GamePlugin<DiceFoosballState, DiceFoosballAction, typeof settings> = {
  id:"dice-foosball", title:"Dice Foosball", category:"dice",
  players:{ min:1, max:1, multiplayer:false },
  description:"Digital table football; first to 5.",
  howToPlay:"Dice Foosball simulates the table football sport where players spin rod-mounted figures to strike a ball into the opposing goal. Real foosball is fiercely competitive in Europe and increasingly in North America, with International Table Soccer Federation championships.\n\nEach round you Roll three dice. Goal mapping: dice sum 16-18 = your goal (+1), sum 3-5 = opponent goal (-1), sum 9-11 = save (0), other sums = neutral midfield exchange. Game ends at 5 goals scored or after 18 rounds.\n\nFinal score equals 60 + (12 × goals) - (6 × opponent goals) + (4 × rounds remaining if you finish early). Average runs land between 80 and 130; a perfect 5-0 finish in few rounds can clear 160.\n\nReal foosball involves dazzling ball control techniques, tic-tac series and pin shots — none of that here, just dice. But the speed-driven exchange and goal-mounted thrill carries through. Press Roll, Next. Quick, recognisably-pub-flavoured, and a fine break between bigger games.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as DiceFoosballSettings),
  reducer,isTerminal,component:DiceFoosballGame,
};
