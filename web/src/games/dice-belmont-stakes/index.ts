import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { DiceBelmontStakesState, DiceBelmontStakesStateAction, DiceBelmontStakesSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { DiceBelmontStakesGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const diceBelmontStakesPlugin: GamePlugin<DiceBelmontStakesState, DiceBelmontStakesStateAction, typeof settings> = {
  id: "dice-belmont-stakes", title: "Dice Belmont Stakes", category: "dice",
  players: { min:1, max:1, multiplayer:false },
  description: "Triple Crown race sim; pedigree shapes performance.",
  howToPlay: "Dice Belmont Stakes models the third leg of America's Triple Crown horse race series. The Belmont Stakes is the longest of the three (1.5 miles, 12 furlongs in length) and rewards stamina-bred horses. Many Triple Crown bids die at Belmont because sprinters fade in the final quarter mile.\n\nThis dice-only sim plays a 14-furlong stretched race. Each round (a furlong), you Roll three dice. Outcomes: triple (your horse stretches lead +3 — Triple Crown!), sum >= 13 (sustained surge +1 your horse), sum <= 6 (stamina fail, opp horse +1), otherwise hold (no change).\n\nGame ends at 14 your points or 14 rounds. Final score formula: 80 + (4 × your points) - (3 × opponent points) + (2 × rounds remaining if you finish early). The Belmont's length is brutal — only stamina horses survive. Average runs 110 to 170. Press Roll, Next.",
  settings,
  initialState: (seed:number, s:S) => initialState(seed, s as DiceBelmontStakesSettings),
  reducer, isTerminal, component: DiceBelmontStakesGame,
};
