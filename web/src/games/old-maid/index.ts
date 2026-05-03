import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { OldMaidState } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { OldMaid } from "./OldMaid.js";

export const oldMaidSettings = {
  players: {
    kind: "enum" as const,
    label: "Players",
    options: ["2", "3", "4"] as const,
    default: "3" as const,
  },
} as const;

type OldMaidAction = { type: "draw"; cardIndex: number };

export const oldMaidPlugin: GamePlugin<OldMaidState, OldMaidAction, typeof oldMaidSettings> = {
  id: "old-maid",
  title: "Old Maid",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Pass cards and make pairs. Whoever's left with the Old Maid (a lone Queen) loses.",
  howToPlay: `Avoid being the last player holding the unpaired Queen — she is the Old Maid.

Setup: one Queen is removed from the deck so exactly one Queen has no pair. All remaining 51 cards are dealt out evenly (extras go to earlier players). Each player immediately discards any pairs from their starting hand.

Gameplay: on your turn you draw one face-down card at random from the player to your left. If the drawn card makes a pair with a card already in your hand, both cards are discarded. Play then passes clockwise. Bots draw from their left neighbor automatically. Any player who empties their hand is safe and out of the game.

Winning: the game ends when only one player is left holding cards — that player has the Old Maid and loses. You score 100 if you are not the loser, and 0 if you end up with the Old Maid.

Strategy: keep your cards in a random order so opponents cannot identify the Queen by position. If you suspect a bot is holding the Old Maid, let other bots empty their hands first — the Old Maid will eventually work its way around.

Settings: choose 2, 3, or 4 total players (you plus 1–3 bots).`,
  settings: oldMaidSettings,
  initialState,
  reducer,
  isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "gameover" || p === "done" || p === "ended" || (s as any).gameOver) return null; return { selector: '[data-testid="hint-target-old-maid-action"]', pulses: 3 }; },
  component: OldMaid,
};
