import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { CardPullBetState, CardPullBetAction, CardPullBetSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { CardPullBetGame } from "./Game.js";
const settings = { rounds: { kind:"enum" as const, label:"Rounds", options:["8","12"] as const, default:"8" as const } } as const;
type S = SettingsOf<typeof settings>;
export const cardPullBetPlugin: GamePlugin<CardPullBetState, CardPullBetAction, typeof settings> = {
  id:"card-pull-bet", title:"Card Pull Bet", category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Pull cards and bet higher or lower. Start with 80 coins over 8 or 12 rounds.",
  howToPlay:`Card Pull Bet is a higher-or-lower guessing game played against a shuffled deck. Each round you see the top card and predict whether the next card pulled will rank higher or lower. Bet any amount up to your current coins. Correct guesses win your bet; wrong guesses lose it. Tied ranks are a push. Start with 80 coins. Choose 8 or 12 rounds in Settings. Can you grow your stake through the full deck?`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as CardPullBetSettings),
  reducer,isTerminal,component:CardPullBetGame,
};
