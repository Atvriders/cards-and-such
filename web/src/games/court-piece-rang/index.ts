import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { CourtPieceRangState, CourtPieceRangAction, CourtPieceRangSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { CourtPieceRangGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const courtPieceRangPlugin: GamePlugin<CourtPieceRangState, CourtPieceRangAction, typeof settings> = {
  id: "court-piece-rang", title: "Court Piece (Rang)", category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "South-Asian call-trump partnership game played in Pakistan and India.",
  howToPlay: "Court Piece, also called Rang in Pakistan and Rung in India, is a popular South Asian partnership trick-taking game. Each player is dealt thirteen cards and one player calls trump (the rang) before play begins. Cards are dealt in batches: the player to the dealer's right sees only the first five cards before calling trump. Tricks must follow suit; trump beats off-suit. The first side to win seven tricks wins the round — but winning all thirteen tricks is a kot (sweep) and scores double. In this six-round CPU duel, click Play Round to deal and play. Strategy: when calling trump from your first five cards, look for a suit with at least three cards including a high honor. Lead long suits to draw trumps from opponents. Aim for at least three round wins and one kot for an excellent Court Piece performance.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as CourtPieceRangSettings),
  reducer, isTerminal,
  hint: (state: any) => {
    if (state.phase === "ready") return { selector: '[data-testid="hint-target-court-piece-rang-primary"]', pulses: 3 };
    if (state.phase === "scored") return { selector: '[data-testid="hint-target-court-piece-rang-next"]', pulses: 3 };
    return null;
  }, component: CourtPieceRangGame,
};
