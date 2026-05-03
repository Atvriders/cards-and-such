import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { DrawCasinoState, DrawCasinoAction, DrawCasinoSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { DrawCasinoGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
const hint = (state: DrawCasinoState): HintTarget | null => (state.phase === "ready" ? { selector: ".dm-btn", pulses: 3 } : null);

export const drawCasinoPlugin: GamePlugin<DrawCasinoState, DrawCasinoAction, typeof settings> = {
  id: "draw-casino", title: "Draw Casino", category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Stock-draw Casino variant: capture cards round-by-round.",
  howToPlay: "Draw Casino is a Casino variant featuring an active stock pile players continuously draw from to refill their hands. In this mini-version, the stock-draw-and-capture cycle is compressed into a 10-round high-card duel against the CPU.\n\nEach round, you and the CPU each \"draw\" one card. Higher rank wins. Aces high (13), twos low (1). Suit doesn't matter — no spade bonus, no special rules.\n\nScoring: round win awards 10 points. Tie awards 4 sympathy points. Loss awards zero.\n\nTen rounds total. Expected score: 45-65 points; lucky games up to 75.\n\nThe full Draw Casino has a constant tension between the stockpile and your hand — drawing always brings new options but also depletes the deck. This mini distills it into round-by-round draws with no decision-making, just the steady flow of fresh cards from the shuffled deck. A clean, fast nod to the family of stock-pile capture games descended from 17th-century Italian Casino.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as DrawCasinoSettings),
  reducer, isTerminal, hint, component: DrawCasinoGame,
};
