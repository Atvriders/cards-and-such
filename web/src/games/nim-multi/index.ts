import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { NimMultiState, NimMultiAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { NimMulti } from "./NimMulti.js";

export const nimMultiSettings = {
  piles: {
    kind: "enum" as const,
    label: "Number of Piles",
    options: ["5", "7", "9"] as const,
    default: "5",
  },
} as const;

type NimMultiSettingsType = SettingsOf<typeof nimMultiSettings>;

export const nimMultiPlugin: GamePlugin<NimMultiState, NimMultiAction, typeof nimMultiSettings> = {
  id: "nim-multi",
  title: "Nim Multi-Pile",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Large-scale Nim with 5, 7, or 9 piles against a perfect bot.",
  howToPlay: `Nim Multi-Pile is an expanded version of the classic stone-taking game. The board contains many piles of stones — 5, 7, or 9 depending on your setting. On your turn, choose one pile and remove at least one stone from it. You may take as many as you like from that single pile. The player who takes the last stone wins.

The bot uses the mathematically optimal Sprague-Grundy strategy: it always aims to leave the XOR of all pile sizes equal to zero. When it is in a losing position it plays a random-fallback move, giving you a chance to win.

To move: click the + and − buttons under any pile to set how many stones to remove, then press Take. The bot replies immediately.

Strategy tip: after each bot move, compute the XOR of all remaining piles in your head. If it is zero you are in a losing position — any move you make will give the bot a winning response. If the XOR is non-zero, there exists a winning move.

Settings: Piles sets the number of piles. More piles increases the board complexity and makes it harder to track the XOR mentally.`,
  settings: nimMultiSettings,
  initialState: (seed: number, settings: NimMultiSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "done" || p === "gameover" || p === "ended" || p === "finished" || (s as any).gameOver || (s as any).won || (s as any).complete || (s as any).isComplete) return null; return { selector: ".nim-multi-take-btn", pulses: 3 }; },
  component: NimMulti,
};
