import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { CardThreeFlipState, CardThreeFlipAction, CardThreeFlipSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { CardThreeFlip } from "./Game.js";
const settings = { rounds: { kind:"enum" as const, label:"Rounds", options:["10","20"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const cardThreeFlipPlugin: GamePlugin<CardThreeFlipState, CardThreeFlipAction, typeof settings> = {
  id: "card-three-flip", title: "Card Three Flip", category: "cards",
  players: { min:1, max:1, multiplayer:false },
  description: "Flip three cards each round and score points based on the highest rank revealed.",
  howToPlay: `Card Three Flip is a quick card-flipping mini-game. Each round, three face-down cards are flipped simultaneously from a shuffled deck. You earn points equal to the rank of the highest card revealed — Aces score 14, Kings 13, and so on down to 2s.

There are no decisions to make — this is a pure luck game that moves fast. Press Flip 3 Cards to reveal your trio, see your points, then press Next Round to continue.

Over 10 or 20 rounds, your points accumulate to form your final score. Consistency wins: multiple Aces or face cards will push your total high.

Choose your round count in Settings. The deck reshuffles at the start of each game, so every session is different. Aim to beat your best score!`,
  settings,
  initialState: (seed:number, s:S) => initialState(seed, s as CardThreeFlipSettings),
  reducer, isTerminal, component: CardThreeFlip,
};
