import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { DiceSpellState, DiceSpellAction, DiceSpellSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { DiceSpellGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const diceSpellPlugin: GamePlugin<DiceSpellState, DiceSpellAction, typeof settings> = {
  id:"dice-spell", title:"Dice Spell", category:"dice",
  players:{ min:1, max:1, multiplayer:false },
  description:"Roll 5 dice to spell a 5-letter word. Each die maps to a letter group. +5 per match.",
  howToPlay:`Dice Spell mashes word puzzles with dice probability. Each round, a 5-letter target word appears, and you roll 5 dice. The dice's pip values map to letter-group categories: 1 = A-E, 2 = F-J, 3 = K-O, 4 = P-T, 5 = U-Y, 6 = wild (matches any group).

For each position in the target word, if the corresponding die shows the matching letter group (or a wild 6), it counts as a match worth 5 points. So a 5-letter word with all matches in a single roll scores 25 points (a perfect spell).

There are 10 rounds total. Words rotate from a small dictionary (DICED, WORLD, STORM, BRAVE, etc.). Random matching probability per die is roughly 33% (one of six standard groups plus the wild), so the expected score per round is about 8 points (~80 across 10 rounds).

Press Roll to throw the dice; press Next to advance. Bonus: rolling all 6s on any round guarantees a perfect 25-point spell.`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as DiceSpellSettings),
  reducer,isTerminal,component:DiceSpellGame,
};
