import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { HordeState, HordeAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { HordeGame } from "./Game.js";

export const hordeSettings = {
  opponent: {
    kind: "enum" as const,
    label: "Difficulty",
    options: ["easy", "medium", "hard"] as const,
    default: "medium",
  },
} as const;

type HordeSettingsType = SettingsOf<typeof hordeSettings>;

export const hordeChessPlugin: GamePlugin<HordeState, HordeAction, typeof hordeSettings> = {
  id: "horde-chess",
  title: "Horde Chess",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "White commands 36 pawns against Black's standard army. Checkmate the black king or lose all your pawns.",
  howToPlay: `Horde Chess is a wildly asymmetric chess variant. White commands a horde of 36 pawns with no other pieces, while Black has a complete standard army (all pieces and pawns). The goals differ by side: White wins by checkmating the Black king, and Black wins by capturing all of White's pawns and promoted pieces.

White's pawns move and capture exactly as normal pawns — forward one or two squares from their starting row, capturing diagonally. When a horde pawn reaches rank 8 (the far side), it promotes and the player chooses queen, rook, bishop, or knight. This is the horde's path to power!

Black plays standard chess: all pieces move normally, castling is legal, en passant works as usual. Black's goal is a war of attrition — picking off pawns one by one until none remain.

The horde must coordinate like an advancing wave, using pawns to protect each other while advancing threats toward the black king. Black must use their superior pieces to systematically dismantle the mass of pawns.

Click a piece to select it, then click a highlighted square to move. You play White (the Horde). Easy = depth 2, Medium = depth 3, Hard = depth 4.`,
  settings: hordeSettings,
  initialState: (seed: number, settings: HordeSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "done" || p === "gameover" || p === "ended" || p === "finished" || (s as any).gameOver || (s as any).won || (s as any).complete || (s as any).isComplete) return null; return { selector: ".hd-promo-btn", pulses: 3 }; },
  component: HordeGame,
};
