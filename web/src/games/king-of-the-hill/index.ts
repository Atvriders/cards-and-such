import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { KothState, KothAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { KothGame } from "./Game.js";

export const kothSettings = {
  opponent: {
    kind: "enum" as const,
    label: "Difficulty",
    options: ["easy", "medium", "hard"] as const,
    default: "medium",
  },
} as const;

type KothSettingsType = SettingsOf<typeof kothSettings>;

export const kingOfTheHillPlugin: GamePlugin<KothState, KothAction, typeof kothSettings> = {
  id: "king-of-the-hill",
  title: "King of the Hill",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Standard chess with one extra win condition: move your king to any of the 4 center squares (d4, e4, d5, e5).",
  howToPlay: `King of the Hill (KOTH) is a chess variant with an exciting alternate win condition: if your king reaches any of the four center squares — d4, e4, d5, or e5 — you win immediately! These squares are highlighted in gold on the board.

All standard chess rules still apply: pieces move normally, checkmate wins, stalemate draws, castling and en passant work as usual, and the 50-move rule and threefold repetition still apply for draws. But now there's a second path to victory that dramatically changes strategy.

With two ways to win, the game becomes a balancing act. You must watch for checkmate threats while also trying to march your king toward the center. But a king rushing to the center can be vulnerable! Opponents will use their pieces to block the king's path, create diversions, or force checkmate before the king can reach safety.

The bot is aware of the center squares and will fight to control them. Watch out — if the bot's king reaches the center first, it wins! Keeping the center squares covered by your pieces prevents the opponent's king from reaching them.

The golden squares in the middle of the board are your target. Get your king there to claim King of the Hill! You play White; the bot plays Black.`,
  settings: kothSettings,
  initialState: (seed: number, settings: KothSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "done" || p === "gameover" || p === "ended" || p === "finished" || (s as any).gameOver || (s as any).won || (s as any).complete || (s as any).isComplete) return null; return { selector: ".kh-promo-btn", pulses: 3 }; },
  component: KothGame,
};
