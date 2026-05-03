import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { RatRaceState, RatRaceAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { RatRace } from "./Game.js";

export const ratRaceSettings = {
  opponents: {
    kind: "enum" as const,
    label: "Opponents",
    options: ["1", "2", "3"] as const,
    default: "1" as const,
  },
} as const;

type RatRaceSettingsType = SettingsOf<typeof ratRaceSettings>;

export const ratRacePlugin: GamePlugin<RatRaceState, RatRaceAction, typeof ratRaceSettings> = {
  id: "rat-race",
  title: "Rat Race",
  category: "board",
  players: { min: 1, max: 4, multiplayer: false },
  description: "Draw cards, race to square 80! Special cards shake up the race.",
  howToPlay: `Rat Race is a chaotic card-driven race game for 2-4 players. You play as blue; bots race against you as red, green, and orange. Everyone starts at square 0 and races to be the first to reach square 80.

On your turn, click "Draw Card" to draw the top card from the shuffled deck of 40 cards. Most cards move you forward by the number shown — the further the better! After seeing your card's effect, click "Next Turn" to pass play to the next racer.

But watch out for the special cards: a Back card forces you to retreat several squares. A Skip card makes you lose your next turn entirely. An Extra Turn card lets you draw again immediately for a double move. A Teleport card jumps you to a specific square on the track — sometimes ahead, sometimes behind where you already are!

The deck is reshuffled automatically when it runs out, so the game always keeps moving. Bots draw and apply cards automatically, with no waiting.

Strategy tip: there's no real strategy here — it's pure chaos and fun! Cheer for good cards and groan at the bad ones. The first player to land on or pass square 80 wins the race!`,
  settings: ratRaceSettings,
  initialState: (seed: number, settings: RatRaceSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "done" || p === "gameover" || p === "ended" || p === "finished" || (s as any).gameOver || (s as any).won || (s as any).complete || (s as any).isComplete) return null; return { selector: ".draw-btn", pulses: 3 }; },
  component: RatRace,
};
