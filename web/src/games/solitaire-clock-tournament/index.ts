import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SolitaireClockState, SolitaireClockAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { SolitaireClockTournament } from "./SolitaireClockTournament.js";

export const solitaireClockTournamentPlugin = {
  id: "solitaire-clock-tournament",
  title: "Clock Tournament",
  category: "solitaire",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Classic Clock patience — send each card to its correct pile before all four Kings turn up!",
  howToPlay: `Clock Tournament is a fully automated solitaire game based on the classic Clock patience. A full 52-card deck is dealt face-down into 13 piles arranged like a clock face — Ace through Queen at positions 1–12, and Kings in the centre.

The game begins at the King pile. Each turn you flip the top card of the current pile face up. That card then travels to its matching clock position — Aces go to pile 1, Tens to pile 10, Jacks to pile 11, Queens to pile 12, Kings to the centre. The card is placed face up on top of its destination pile, and you then flip the next card from that pile.

The game is lost if all four Kings are face up before every other pile is complete. The game is won if every non-King pile has all its cards correctly face up before the fourth King turns over. Winning Clock is rare — only about 1 in 13 shuffles allow it — making every victory satisfying!`,
  settings: {} as Record<string, never>,
  initialState: (seed: number) => initialState(seed),
  reducer,
  isTerminal,
  component: SolitaireClockTournament,
} as unknown as GamePlugin;
