import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { CardHighPickState, CardHighPickAction, CardHighPickSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { CardHighPickGame } from "./Game.js";
const settings = { rounds: { kind:"enum" as const, label:"Rounds", options:["10","20"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const cardHighPickPlugin: GamePlugin<CardHighPickState, CardHighPickAction, typeof settings> = {
  id: "card-high-pick", title: "Card High Pick", category: "cards",
  players: { min:1, max:1, multiplayer:false },
  description: "Four cards are dealt — pick the highest ranked one for maximum points!",
  howToPlay: `Card High Pick deals four face-up cards. Your goal each round is to identify and click the highest ranked card.

Click the card you believe has the highest rank (Ace is highest, 2 is lowest). A perfect pick earns 30 points. Being one rank off earns 25, two off earns 20, and so on.

Over 10 or 20 rounds, consistently picking the highest card will maximize your score. Look for Aces, Kings, and Queens — they're your best friends in this game!`,
  settings,
  initialState: (seed:number, s:S) => initialState(seed, s as CardHighPickSettings),
  reducer, isTerminal, hint: (state) => isTerminal(state) ? null : ({ selector: '[data-testid="hint-target-card-high-pick-primary"]', pulses: 3 }), component: CardHighPickGame,
};
