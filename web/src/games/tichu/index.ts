import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { TichuState } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { TichuGame } from "./Game.js";

export const tichuSettings = {
  dummy: { kind: "enum" as const, label: "Mode", options: ["off"] as const, default: "off" as const },
} as const;

type TichuAction = { type: "play"; cardIds: string[] } | { type: "pass" };

export const tichuPlugin: GamePlugin<TichuState, TichuAction, typeof tichuSettings> = {
  id: "tichu",
  title: "Tichu",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Partnership climbing card game from Switzerland. Beat your opponents in teams of two.",
  howToPlay: `Tichu is a partnership climbing card game for 4 players — you and Bot 2 form one team, Bot 1 and Bot 3 the other.

Setup: all 52 cards are dealt evenly (13 per player). You lead the first round.

Card ranking: 3 is lowest, rising through 4-5-6-7-8-9-10-J-Q-K-A-2 (highest). Suits do not matter.

Legal plays: lead any set of cards of identical rank (single, pair, triple, or quad). All other players must either play the same number of same-rank cards with a strictly higher rank, or pass.

Passing: once all three opponents pass in sequence, the last player to play leads a brand new round.

Team victory (Double Win): if both teammates finish first and second before any opponent, the team scores 200 points automatically.

Scoring: the first player to empty their hand earns 100 points for their team. The last player's remaining cards go to the opposing team.

Strategy: coordinate with your partner. Let a teammate win the lead when possible, and pass when the last player who played is your partner.`,
  settings: tichuSettings,
  initialState,
  reducer,
  isTerminal,
  component: TichuGame,
};
