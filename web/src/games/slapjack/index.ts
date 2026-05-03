import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SlapjackState } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { Slapjack } from "./Slapjack.js";

export const slapjackSettings = {
  botSpeed: {
    kind: "enum" as const,
    label: "Bot Speed",
    options: ["slow", "medium", "fast"] as const,
    default: "medium" as const,
  },
} as const;

type SlapjackAction = { type: "flip" } | { type: "slap" } | { type: "bot-slap" };

export const slapjackPlugin: GamePlugin<SlapjackState, SlapjackAction, typeof slapjackSettings> = {
  id: "slapjack",
  title: "Slapjack",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Slap when a Jack is flipped. Fastest hand wins the pile.",
  howToPlay: `Be the first to slap the pile whenever a Jack appears — and collect all 52 cards to win.

Setup: the deck is split evenly, 26 cards each. Both players hold their pile face-down.

Gameplay: click Flip Card to turn the top card of your pile face-up onto the central pile. You and the bot alternate flipping one card at a time. Watch the centre carefully — the moment a Jack appears, a slap window opens. Click the SLAP button before the bot reacts to steal the whole pile and add it to the bottom of your deck.

If a player runs out of cards when it is their turn to flip, they lose immediately.

Only Jacks trigger the slap — other cards just stack up. After a slap, flipping resumes with the player who did not just win the pile.

Winning: the player who collects all 52 cards wins (score 100). Losing scores 0.

Tips: keep your cursor near the SLAP button. Jacks appear roughly once every 13 cards, so pay close attention. Adjust Bot Speed in settings — fast mode gives you less than a second to react.`,
  settings: slapjackSettings,
  initialState,
  reducer,
  isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "gameover" || p === "done" || p === "ended" || (s as any).gameOver) return null; return { selector: '[data-testid="hint-target-slapjack-action"]', pulses: 3 }; },
  component: Slapjack,
};
