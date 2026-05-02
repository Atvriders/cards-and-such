import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { CardSnapPairState, CardSnapPairAction, CardSnapPairSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { CardSnapPairGame } from "./Game.js";
const settings = { rounds: { kind:"enum" as const, label:"Rounds", options:["10","20"] as const, default:"10" as const } } as const;
type S = SettingsOf<typeof settings>;
export const cardSnapPairPlugin: GamePlugin<CardSnapPairState, CardSnapPairAction, typeof settings> = {
  id: "card-snap-pair", title: "Card Snap Pair", category: "cards",
  players: { min:1, max:1, multiplayer:false },
  description: "Snap two cards each round — if they share the same rank, score big!",
  howToPlay: `Card Snap Pair is a luck-based matching game. Each round you draw two random cards simultaneously. If both cards share the same rank — for example, both are Jacks or both are 3s — you score 20 points and get a Snap!

If the ranks don't match, you still earn 5 consolation points. Over 10 or 20 rounds your score accumulates — lucky sessions with multiple snaps will end very high.

The game requires no decisions: just press Snap and see what fate delivers. Can you get multiple snaps in a row for a massive score?`,
  settings,
  initialState: (seed:number, s:S) => initialState(seed, s as CardSnapPairSettings),
  reducer, isTerminal, hint: (state) => isTerminal(state) ? null : ({ selector: '[data-testid="hint-target-card-snap-pair-primary"]', pulses: 3 }), component: CardSnapPairGame,
};
