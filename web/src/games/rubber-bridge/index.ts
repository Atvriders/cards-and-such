import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { RubberBridgeState, RubberBridgeAction, RubberBridgeSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { RubberBridgeGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const rubberBridgePlugin: GamePlugin<RubberBridgeState, RubberBridgeAction, typeof settings> = {
  id: "rubber-bridge", title: "Rubber Bridge", category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Classic home bridge with rubber scoring across multiple games.",
  howToPlay: "Rubber Bridge is the classic home version of Contract Bridge played for stakes between two partnerships. A rubber is the best two-of-three games, where a game is the first side to one hundred trick-score points across one or more deals. Honor bonuses, slam bonuses, and vulnerability premium scoring all factor into the rubber total. In this six-round CPU duel, click Play Round to bid and play. Strategy: in rubber bridge, getting to game on each deal is critical so bid for game if you have the values (twenty-six combined high-card points and an eight-card fit). Sacrifice bids against opponent's vulnerable contract are profitable. Defensive doubles for penalty work better when partner is silent. Aim to win at least three rounds and one full rubber across the match. A rubber win pays seven hundred bonus points — chase those rubbers for the strongest score.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as RubberBridgeSettings),
  reducer, isTerminal, component: RubberBridgeGame,
};
