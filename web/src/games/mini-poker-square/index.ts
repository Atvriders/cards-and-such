import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { MiniPokerSquareState, MiniPokerSquareAction, MiniPokerSquareSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { MiniPokerSquareGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const miniPokerSquarePlugin: GamePlugin<MiniPokerSquareState, MiniPokerSquareAction, typeof settings> = {
  id:"mini-poker-square", title:"Mini Poker Square", category:"solitaire",
  players:{ min:1, max:1, multiplayer:false },
  description:"Poker Square 5×5 grid solitaire mini.",
  howToPlay:"Mini Poker Square is a tiny version of the classic 5×5 Poker Square (also known as Poker Solitaire). Twenty-five cards are dealt face-up — one for each grid cell. The full game asks you to build poker hands across rows and columns; in this mini, simply tap any card to lift it from the grid, scoring 15 points per click.\n\nYou have 30 clicks total. The full game's best plays score thousands using straights and flushes, but the mini focuses on the satisfaction of clearing the entire 5×5 layout — 375 points if you clear it all in 25 clicks (you have 30 to spare).\n\nPoker Square has been a casino staple for over a century. A relaxed micro version perfect for a 1-minute card fix.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as MiniPokerSquareSettings),
  reducer,isTerminal,component:MiniPokerSquareGame,
};
