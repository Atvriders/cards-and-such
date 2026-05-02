import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { CardLowPickState, CardLowPickAction, CardLowPickSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { CardLowPickGame } from "./Game.js";
const settings = { rounds: { kind:"enum" as const, label:"Rounds", options:["10","20"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const cardLowPickPlugin: GamePlugin<CardLowPickState, CardLowPickAction, typeof settings> = {
  id: "card-low-pick", title: "Card Low Pick", category: "cards",
  players: { min:1, max:1, multiplayer:false },
  description: "Four cards are dealt — pick the lowest ranked one for maximum points!",
  howToPlay: `Card Low Pick deals four face-down cards that are then revealed. Your goal each round is to identify and click the card with the lowest rank.

Click the card you believe has the lowest rank (2 is lowest, Ace is highest). A perfect pick earns 30 points. Picking a card that is one rank above the lowest earns 25, two above earns 20, and so on.

Over 10 or 20 rounds, consistently picking the lowest card will maximize your score. Watch for 2s, 3s, and 4s — they're your friends in this game!`,
  settings,
  initialState: (seed:number, s:S) => initialState(seed, s as CardLowPickSettings),
  reducer, isTerminal, hint: (state) => isTerminal(state) ? null : ({ selector: '[data-testid="hint-target-card-low-pick-primary"]', pulses: 3 }), component: CardLowPickGame,
};
