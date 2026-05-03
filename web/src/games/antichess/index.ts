import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { AntichessState, AntichessAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { AntichessGame } from "./Game.js";

export const antichessSettings = {
  opponent: {
    kind: "enum" as const,
    label: "Difficulty",
    options: ["easy", "medium", "hard"] as const,
    default: "medium",
  },
} as const;

type AntichessSettingsType = SettingsOf<typeof antichessSettings>;

export const antichessPlugin: GamePlugin<AntichessState, AntichessAction, typeof antichessSettings> = {
  id: "antichess",
  title: "Antichess",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Reverse chess: the goal is to lose ALL your pieces. Captures are mandatory if available. Stalemate wins!",
  howToPlay: `Antichess (also called Giveaway Chess or Losing Chess) turns chess upside down. The goal is to lose ALL your pieces — the first player to have no pieces remaining wins! If you have no legal moves, you also win.

Two rules make Antichess radically different from regular chess: First, if a capture is available, you MUST take it. If multiple captures are possible, you choose which one to make, but you cannot skip capturing. This forces you into bad trades! Second, the king has no special status — it can be captured, moved into "check," and treated like any other piece.

Pawns can promote to any piece including king. Since you want fewer pieces, promoting to a king (which is easy to give away) is often a great move. En passant captures are available as normal.

Strategy flips entirely from regular chess. You want to sacrifice pieces, force opponents to capture you, and maneuver into positions where your pieces are captured quickly. Pawns — so easy to give away — are often your best asset. Queens can be powerful for self-sacrifice since everyone wants to take a free queen!

Watch for forced captures — the purple squares show where you can move, and if you see a "MUST capture" warning, you have no choice. The bot also must follow capture rules, so luring it into mass captures can backfire!

You play White; the bot plays Black.`,
  settings: antichessSettings,
  initialState: (seed: number, settings: AntichessSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "done" || p === "gameover" || p === "ended" || p === "finished" || (s as any).gameOver || (s as any).won || (s as any).complete || (s as any).isComplete) return null; return { selector: ".ac-promo-btn", pulses: 3 }; },
  component: AntichessGame,
};
