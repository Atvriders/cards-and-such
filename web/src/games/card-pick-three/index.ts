import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { CardPickThreeState, CardPickThreeAction, CardPickThreeSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { CardPickThree } from "./Game.js";
const settings = { rounds: { kind:"enum" as const, label:"Rounds", options:["10","20"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const cardPickThreePlugin: GamePlugin<CardPickThreeState, CardPickThreeAction, typeof settings> = {
  id: "card-pick-three", title: "Card Pick Three", category: "cards",
  players: { min:1, max:1, multiplayer:false },
  description: "Pick 3 of 5 face-down cards and score the sum of their ranks.",
  howToPlay: `Card Pick Three is a simple selection mini-game. Each round, five cards are placed face-down from a shuffled deck. Your job: select exactly three of them by clicking. Once three are chosen, press Confirm Pick to reveal them and score the sum of their rank values — Aces are worth 14, Kings 13, and so on down to 2s.

Since all cards are face-down, each pick is a blind choice — but with exactly five cards, probability and gut instinct are your only tools. You hope to avoid the low cards and hit the high ones.

Play over 10 or 20 rounds, building up your cumulative point total. The maximum per round is 14+13+12 = 39 points (A, K, Q). Aim for consistency!

Settings allow you to choose the round count. The deck is shuffled fresh each game for variety.`,
  settings,
  initialState: (seed:number, s:S) => initialState(seed, s as CardPickThreeSettings),
  reducer, isTerminal, hint: (state: CardPickThreeState): HintTarget | null => (state.phase === "picking" ? { selector: '[data-testid="hint-target-card-pick-three-primary"]', pulses: 3 } : null), component: CardPickThree,
};
