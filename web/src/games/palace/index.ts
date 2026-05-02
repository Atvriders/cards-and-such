import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import { initialState, reducer, isTerminal, canPlay, activeZone, type PalaceState, type PalaceAction } from "./state.js";
import { PalaceGame } from "./Game.js";

export const palaceSettings = {
  opponents: { kind: "enum" as const, label: "Opponents", options: ["1", "2", "3"] as const, default: "1" as const },
} as const;

export const palacePlugin: GamePlugin<PalaceState, PalaceAction, typeof palaceSettings> = {
  id: "palace",
  title: "Palace",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Shed your hand, then table cards, then blind cards to escape the palace first.",
  howToPlay: `Palace (also called Shithead or Karma) is a popular shedding game for 2-4 players. Each player starts with three cards in hand, three face-up table cards, and three face-down (blind) table cards.

On your turn, play one or more cards of the same rank onto the discard pile — they must equal or beat the current top card. If you cannot play, you must pick up the entire pile and add it to your hand. Refill your hand from the draw pile whenever it falls below three cards.

Special cards: 2 (wild — plays on anything and resets the pile so the next player can play anything), 10 (burns — instantly removes the pile from the game). Playing four of the same rank in a row also burns the pile.

Once your hand is empty and the draw pile is gone, play from your face-up table cards. Once those are gone, flip face-down table cards one at a time blindly. If a blind card cannot legally play, you must pick up the discard pile and use those cards as your hand first.

The first player to get rid of all cards — hand, face-up, and face-down — wins. Score 500 for a win, 50 for a loss.`,
  settings: palaceSettings,
  initialState,
  reducer,
  isTerminal,
  hint: (state: PalaceState): HintTarget | null => {
    if (state.phase === "done" || state.winner !== null) return null;
    if (state.turn !== 0) return null;
    const me = state.players[0];
    if (!me) return null;
    const zone = activeZone(me);
    if (zone === "tableDown") {
      // Blind: just pulse first face-down card.
      const c = me.tableDown[0];
      if (c) return { selector: `[data-testid="hint-target-palace-${c.id}"]`, pulses: 3 };
      return null;
    }
    const source = zone === "hand" ? me.hand : me.tableUp;
    // Prefer playing the lowest-rank legal card; reserve 2s and 10s.
    const legal = source.filter((c) => canPlay(c, state.discardPile));
    if (legal.length === 0) {
      if (state.discardPile.length > 0) {
        return { selector: '[data-testid="hint-target-palace-pickup"]', pulses: 3 };
      }
      return null;
    }
    const ranked = [...legal].sort((a, b) => {
      // Save specials for later: rank 2 (wild) and 10 (burn) get bumped to last.
      const score = (r: number): number => (r === 2 ? 100 : r === 10 ? 99 : r === 1 ? 14 : r);
      return score(a.rank) - score(b.rank);
    });
    const choice = ranked[0]!;
    return { selector: `[data-testid="hint-target-palace-${choice.id}"]`, pulses: 3 };
  },
  component: PalaceGame,
};
