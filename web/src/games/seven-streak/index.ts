import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { SevenStreakState, SevenStreakAction, SevenStreakSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { SevenStreakGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const sevenStreakPlugin: GamePlugin<SevenStreakState, SevenStreakAction, typeof settings> = {
  id:"seven-streak", title:"Seven Streak", category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Hunt sevens in 12 single-card draws. +50 per seven.",
  howToPlay:`Seven Streak is a single-card luck-tester focused on the lucky number 7. You'll make 12 draws, one card per draw. Every 7 (any suit) scores 50 points; every other card scores zero.

The probability of any draw being a 7 is 4/52 (about 7.7%). Across 12 draws, you can expect about 0.92 sevens on average, or roughly 46 points. Two sevens in a game is a typical-good outing; three is hot; four+ is the deck rolling out the red carpet for you.

Press Draw to flip a card and Next to advance. The display shows your sevens count and running point total. The thrill is in the steady rhythm of drawing and that little jolt of joy when a 7 lands. Settle in, draw 12, and see how lucky your seed of seeds turns out to be!`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as SevenStreakSettings),
  reducer,isTerminal,component:SevenStreakGame,
};
