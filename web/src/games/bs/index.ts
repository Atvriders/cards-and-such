import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { BSState } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { BS } from "./BS.js";
import type { Rank } from "../../engines/deck/index.js";

export const bsSettings = {
  players: {
    kind: "enum" as const,
    label: "Players",
    options: ["3", "4"] as const,
    default: "4" as const,
  },
} as const;

type BSAction =
  | { type: "play"; cardIds: string[]; claimRank: Rank }
  | { type: "call-bs" }
  | { type: "pass" };

export const bsPlugin: GamePlugin<BSState, BSAction, typeof bsSettings> = {
  id: "bs",
  title: "BS (Cheat)",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Play cards claiming their rank — or lie. Call BS when you don't believe it.",
  howToPlay: `Empty your hand first by playing cards face-down — truthfully or not — and catching others in lies.

Setup: 52 cards are dealt roughly evenly to 3 or 4 players. Players must play cards each turn claiming a specific rank. The required rank cycles through Ace, 2, 3 … King, Ace, 2 … on each successive play.

Gameplay: on your turn, select 1–4 cards from your hand and click Play. You claim they are all the current required rank — but they can be anything. After you play, any other player may call BS. If they do, your face-down cards are flipped: if you were lying, you take the entire pile; if you were honest, the caller takes the pile. If nobody calls BS, the cards go onto the pile and play continues.

Bots play automatically. You may call BS on bot plays by clicking the Call BS button. Clicking Believe It accepts the bot's claim and moves on.

Winning: the first player to empty their hand wins, scoring 100. Any other outcome scores 0.

Tips: lying is tempting, but the bigger the pile, the riskier a failed BS call is. Watch which ranks opponents hold — if you have four Aces, someone claiming Aces is almost certainly lying.`,
  settings: bsSettings,
  initialState,
  reducer,
  isTerminal,
  component: BS,
};
