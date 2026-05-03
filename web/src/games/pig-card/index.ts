import type { GamePlugin } from "../../platform/game-plugin/types.js";
import { initialState, reducer, isTerminal, type PigState, type PigAction } from "./state.js";
import { PigGame } from "./Game.js";

export const pigCardSettings = {
  opponents: { kind: "enum" as const, label: "Opponents", options: ["1", "2", "3"] as const, default: "2" as const },
} as const;

export const pigCardPlugin: GamePlugin<PigState, PigAction, typeof pigCardSettings> = {
  id: "pig-card",
  title: "Pig",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Collect four of a kind and touch your nose before anyone notices!",
  howToPlay: `Pig is a classic reaction card game for 2-4 players. Each player starts with four cards and three lives.

All players simultaneously pass one card from their hand to the player on their left, then pick up the card that arrived from their right. Keep passing until someone holds four cards of the same rank.

The instant any player collects four of a kind they secretly touch their nose. Other players who notice must also touch their nose as fast as possible. The last player to touch their nose — the one who didn't notice — loses a life!

In this digital version, bots will touch their nose automatically. You must click the "Touch Your Nose" button the moment the nose-phase begins. Be alert! A bot may touch its nose even without four of a kind just to try to trick you.

A player who loses all three lives is eliminated. The last player with lives remaining wins.

Tips: watch the bots carefully — if one touches its nose, react immediately. Try to hold a pair or triple early so you're close to four of a kind when the right card comes around.`,
  settings: pigCardSettings,
  initialState,
  reducer,
  isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "gameover" || p === "done" || p === "ended" || (s as any).gameOver || (s as any).won || (s as any).isWon || (s as any).isComplete || (s as any).complete) return null; return { selector: '[data-testid="hint-target-pig-card-action"]', pulses: 3 }; },
  component: PigGame,
};
