import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SnapState } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { Snap } from "./Snap.js";

export const snapSettings = {
  botSpeed: {
    kind: "enum" as const,
    label: "Bot Speed",
    options: ["slow", "medium", "fast"] as const,
    default: "medium" as const,
  },
} as const;

type SnapAction = { type: "flip" } | { type: "snap" } | { type: "bot-snap" };

export const snapPlugin: GamePlugin<SnapState, SnapAction, typeof snapSettings> = {
  id: "snap",
  title: "Snap",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Flip cards one at a time. Click SNAP when two matching ranks show in a row.",
  howToPlay: `Race the bot to shout "Snap!" when two cards of the same rank appear on top of the pile.

Setup: the 52-card deck is split evenly — 26 cards each. Both players keep their cards face-down in a personal pile.

Gameplay: click Flip Card to turn over the top card of your deck onto the central pile. You and the bot alternate flipping one card at a time. When two consecutive cards on the pile share the same rank, a Snap window opens. Click the SNAP button as fast as you can! If you click SNAP first, you collect the entire pile and add it to the bottom of your deck. If you hesitate, the bot snaps and takes the pile instead.

If a player runs out of cards while it is their turn to flip, they lose.

Winning: the first player to collect all 52 cards wins, scoring 100 points. Losing scores 0.

Tips: keep your eyes on the rank in the centre — not the suit. Stay alert for quick repeats, especially with common ranks like 5s and 7s. Change Bot Speed in settings if the default pace is too easy or too hard.`,
  settings: snapSettings,
  initialState,
  reducer,
  isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "gameover" || p === "done" || p === "ended" || (s as any).gameOver) return null; return { selector: '[data-testid="hint-target-snap-action"]', pulses: 3 }; },
  component: Snap,
};
