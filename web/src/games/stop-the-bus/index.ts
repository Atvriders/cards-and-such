import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { StopTheBusState } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { StopTheBusGame } from "./Game.js";

export const stopTheBusSettings = {
  dummy: { kind: "enum" as const, label: "Mode", options: ["off"] as const, default: "off" as const },
} as const;

type StopTheBusAction =
  | { type: "swap"; handIdx: number; poolIdx: number }
  | { type: "swapAll" }
  | { type: "stopTheBus" }
  | { type: "pass" };

export const stopTheBusPlugin: GamePlugin<StopTheBusState, StopTheBusAction, typeof stopTheBusSettings> = {
  id: "stop-the-bus",
  title: "Stop the Bus",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Build the best 3-card hand by swapping with the pool. Stop the bus when you're ready!",
  howToPlay: `Stop the Bus (also called Bastard or Ride the Bus) is a fun hand-building card game for 4 players. You play against three bots.

Setup: each player is dealt 3 cards face-down. Three additional cards are placed face-up in the centre (the pool).

Goal: build the best possible 3-card hand. Scoring uses the highest value from cards of the same suit: Ace = 11, face cards = 10, others = face value. Three of a kind (any suit) scores 30.5 — the maximum possible.

On your turn you may:
• Swap one of your cards with any pool card
• Swap all 3 of your cards for the entire pool
• Pass (do nothing)
• Stop the Bus — declare that everyone gets one more turn, then scores are compared

The player who stops the bus must have the highest (or equal) hand — otherwise they score 0.

Strategy: aim for 31 or a flush sum above 28 before stopping. If your hand is weak after others pass, swap aggressively. The pool cards are visible, so plan your swaps carefully.`,
  settings: stopTheBusSettings,
  initialState,
  reducer,
  isTerminal,
  hint: (state: StopTheBusState): HintTarget | null => {
    if (isTerminal(state)) return null;
    return { selector: '[data-testid="hint-target-stop-the-bus-primary"]', pulses: 3 };
  },
  component: StopTheBusGame,
};
