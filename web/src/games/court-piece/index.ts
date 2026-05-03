import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { CourtPieceState } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const CourtPiece = /* @__PURE__ */ lazy(() => import("./CourtPiece.js").then((mod) => ({ default: mod.CourtPiece as unknown as React.ComponentType<unknown> })));
const courtPieceSettings = {} as const;
type CourtPieceSettings = SettingsOf<typeof courtPieceSettings>;
type CourtPieceAction = { type: "play"; cardId: string };

export const courtPiecePlugin: GamePlugin<CourtPieceState, CourtPieceAction, typeof courtPieceSettings> = {
  id: "court-piece",
  title: "Court Piece",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "South-Asian call-trump partnership game — 1v1 duel.",
  howToPlay: `Court Piece (Rang) is a South-Asian partnership trick-taking game where the right to choose trump rotates each hand. This simplified 1v1 duel uses diamonds as fixed trump. You and the bot each receive 13 cards from a standard 52-card deck. Each trick: follow the led suit if able, otherwise play any card including trump. Highest diamond wins; otherwise highest of the led suit. Click cards to play. Trick winner leads next. Strategy: count diamonds carefully — with 13 in the deck, knowing how many are out makes endgame play decisive. Lead long side suits early to flush trumps, then cash your remaining diamonds. Score is tricks taken — capture 7 of 13 tricks to win the round and a symbolic 'court' to your name.`,
  settings: courtPieceSettings,
  initialState: (seed: number, _settings: CourtPieceSettings) => initialState(seed),
  reducer,
  isTerminal,
  hint: (state: any) => {
      if (state.phase === "playing") return { selector: '[data-testid="hint-target-court-piece-hand"]', pulses: 3 };
      return null;
    },
  component: CourtPiece,
};
