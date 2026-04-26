import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { CardStackBet2State, CardStackBet2Action, CardStackBet2Settings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { CardStackBet2Game } from "./Game.js";
const settings = { rounds: { kind:"enum" as const, label:"Rounds", options:["8","12"] as const, default:"8" as const } } as const;
type S = SettingsOf<typeof settings>;
export const cardStackBet2Plugin: GamePlugin<CardStackBet2State, CardStackBet2Action, typeof settings> = {
  id:"card-stack-bet-2", title:"Card Stack Bet 2", category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"A 120-coin higher-or-lower card betting session with fresh deck each game.",
  howToPlay:`Card Stack Bet 2 gives you 120 coins to wager on higher-or-lower predictions across a freshly shuffled deck. Each round you see the top card, choose a bet amount, and call higher or lower for the next card. Correct predictions win your bet; wrong ones lose it; equal ranks are a tie. Suits don't affect rank comparison. Choose 8 or 12 rounds in Settings. Use your larger starting stack to make bigger bets and aim for maximum coins at the end!`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as CardStackBet2Settings),
  reducer,isTerminal,component:CardStackBet2Game,
};
