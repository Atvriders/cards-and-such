import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { EgyptianRatscrewState } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { EgyptianRatscrew } from "./EgyptianRatscrew.js";

export const egyptianRatscrewSettings = {
  botSpeed: {
    kind: "enum" as const,
    label: "Bot Speed",
    options: ["slow", "medium", "fast"] as const,
    default: "medium" as const,
  },
} as const;

type ERSAction = { type: "flip" } | { type: "slap" } | { type: "bot-slap" };

export const egyptianRatscrewPlugin: GamePlugin<EgyptianRatscrewState, ERSAction, typeof egyptianRatscrewSettings> = {
  id: "egyptian-ratscrew",
  title: "Egyptian Ratscrew",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Slap on doubles and survive face-card challenges. Fastest player wins the pile.",
  howToPlay: `Collect all 52 cards using quick reflexes and face-card challenges.

Setup: 52 cards split evenly — 26 each. Players alternate flipping one card at a time face-up onto the central pile.

Slap rule: whenever two consecutive cards on the pile share the same rank (a "double"), a slap window opens. Click SLAP immediately to steal the whole pile. If you hesitate, the bot slaps first and wins the pile.

Face-card challenge: whenever a Jack, Queen, King, or Ace is flipped, the other player must "pay tribute" — they flip a set number of cards (J=1, Q=2, K=3, A=4). If one of those tribute cards is also a face card or Ace, the challenge reverses back to the original player. If all tribute cards are number cards, the challenger wins the pile.

If a player runs out of cards on their flip turn, they lose immediately.

Winning: collect all 52 cards to win (score 100). Losing scores 0.

Tips: watch for chains of face cards — multiple reversals can happen in a row. Always keep your cursor near the SLAP button when a double-heavy run starts.`,
  settings: egyptianRatscrewSettings,
  initialState,
  reducer,
  isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "gameover" || p === "done" || p === "ended" || (s as any).gameOver) return null; return { selector: '[data-testid="hint-target-egyptian-ratscrew-action"]', pulses: 3 }; },
  component: EgyptianRatscrew,
};
