import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { ThreeCheckState, ThreeCheckAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { ThreeCheckGame } from "./Game.js";

export const threeCheckSettings = {
  opponent: {
    kind: "enum" as const,
    label: "Difficulty",
    options: ["easy", "medium", "hard"] as const,
    default: "medium",
  },
} as const;

type ThreeCheckSettingsType = SettingsOf<typeof threeCheckSettings>;

export const threeCheckPlugin: GamePlugin<ThreeCheckState, ThreeCheckAction, typeof threeCheckSettings> = {
  id: "three-check",
  title: "Three-Check Chess",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Win by giving check three times — or by checkmate. Aggressive attacking chess where every check counts.",
  howToPlay: `Three-Check Chess adds one simple but electrifying rule to standard chess: giving check three times wins the game, even without checkmate! The check counter is shown with colored dots: three filled dots means victory for that player.

All standard chess rules apply: pieces move normally, castling and en passant work as usual, pawn promotion is available, and checkmate still wins immediately. The 50-move rule still applies for draws. But now every check is a threat — accumulating three checks is an alternative victory condition.

This rule completely transforms strategy. Attacks that merely give check become powerful even if the king can escape. Sacrificing material to deliver repeated checks can win the game. A rook sacrifice that gives two checks in a row might be the winning line. Defense must be active and vigilant — you can't afford to let your king be checked repeatedly.

Watch the check counter carefully. When you've given two checks, one more wins — and the bot will do everything to avoid a third check while trying to accumulate its own. Games are often sharp and tactical with sudden decisive attacks.

Pieces: King ♔, Queen ♕, Rook ♖, Bishop ♗, Knight ♘, Pawn ♙. You play White; the bot plays Black.`,
  settings: threeCheckSettings,
  initialState: (seed: number, settings: ThreeCheckSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "done" || p === "gameover" || p === "ended" || p === "finished" || (s as any).gameOver || (s as any).won || (s as any).complete || (s as any).isComplete) return null; return { selector: ".tc-promo-btn", pulses: 3 }; },
  component: ThreeCheckGame,
};
