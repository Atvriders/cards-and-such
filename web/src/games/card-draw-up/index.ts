import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { CardDrawUpState, CardDrawUpAction, CardDrawUpSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { CardDrawUp } from "./Game.js";
const settings = { rounds: { kind:"enum" as const, label:"Rounds", options:["5","10"] as const, default:"5" as const } } as const;
type S = SettingsOf<typeof settings>;
export const cardDrawUpPlugin: GamePlugin<CardDrawUpState, CardDrawUpAction, typeof settings> = {
  id: "card-draw-up", title: "Card Draw Up", category: "cards",
  players: { min:1, max:1, multiplayer:false },
  description: "Draw cards one by one and stop before your total exceeds 21. Score your running total when you stop.",
  howToPlay: `Card Draw Up is a Blackjack-inspired mini-game with a scoring twist. Each round starts at zero. Press Draw to reveal a card from the shuffled deck and add its value to your running total (face cards count as 10, number cards at face value).

Keep drawing to push your total higher — but go over 21 and you bust, scoring zero for the round. Press Stop at any time to bank your current total as points for that round.

Strategy matters: is 17 safe enough to stop, or will the next card be a 3? Each decision affects your cumulative score across all rounds.

Play 5 or 10 rounds (selectable in Settings). Maximize your round scores without busting, then compare your final total to your best!`,
  settings,
  initialState: (seed:number, s:S) => initialState(seed, s as CardDrawUpSettings),
  reducer, isTerminal, component: CardDrawUp,
};
