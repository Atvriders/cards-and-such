import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { DiceTallyState, DiceTallyAction, DiceTallySettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { DiceTallyGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const diceTallyPlugin: GamePlugin<DiceTallyState, DiceTallyAction, typeof settings> = {
  id:"dice-tally", title:"Dice Tally", category:"dice",
  players:{ min:1, max:1, multiplayer:false },
  description:"Roll 5 dice across 8 rounds with rotating tally categories.",
  howToPlay:"Dice Tally is an 8-round dice game where each round you roll five six-sided dice and score against a fixed category. The categories cycle in a fixed order: Ones, Twos, Threes, Fours, Fives, Sixes, Highest die, and Sum All Dice.\n\nFor categories Ones through Sixes, your score is the sum of dice matching that face value. For example, rolling 1-3-3-5-3 in the Threes round scores 9 (three threes × 3). The Highest category scores just the largest die; Sum All scores the sum of all five dice.\n\nEach round, press \"Roll 5 Dice\" to roll. The dice display, the category resolves, and you see the points awarded. Press Next to advance.\n\nThere's no choice — the category is set by the round number — so the game is pure variance. Average expected scores hover near 75. Lucky runs hit 100+; unlucky runs land in the 50s. Dice Tally is great practice for understanding dice probability and tally-style scoring.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as DiceTallySettings),
  reducer,isTerminal,component:DiceTallyGame,
};
