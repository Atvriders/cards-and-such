import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { CardStreakFlipState, CardStreakFlipAction, CardStreakFlipSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { CardStreakFlipGame } from "./Game.js";
const settings = { rounds: { kind:"enum" as const, label:"Rounds", options:["8","12"] as const, default:"8" as const } } as const;
type S = SettingsOf<typeof settings>;
export const cardStreakFlipPlugin: GamePlugin<CardStreakFlipState, CardStreakFlipAction, typeof settings> = {
  id:"card-streak-flip", title:"Card Streak Flip", category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"Build a streak of correct higher-or-lower guesses for increasing multipliers!",
  howToPlay:`Card Streak Flip rewards consistency. Each consecutive correct prediction increases your payout multiplier — 1x, 2x, 3x, up to 4x. One wrong guess resets your streak to zero. Start with 100 coins. Each round you see the top card, set a bet, and call higher or lower. A win extends your streak; a loss resets it. The longer your streak, the bigger the rewards! Choose 8 or 12 rounds in Settings.`,
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as CardStreakFlipSettings),
  reducer,isTerminal,component:CardStreakFlipGame,
};
