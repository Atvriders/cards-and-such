import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget, SettingsOf } from "../../platform/game-plugin/types.js";
import type { ClueFullState, ClueFullAction, ClueFullSettings } from "./state.js";
import { initialState, reducer, isTerminal, settings, passagePartner } from "./state.js";

const ClueFullGame = /* @__PURE__ */ lazy(() =>
  import("./Game.js").then((mod) => ({
    default: mod.ClueFullGame as unknown as React.ComponentType<unknown>,
  })),
);

type S = SettingsOf<typeof settings>;

export const clueFullPlugin: GamePlugin<ClueFullState, ClueFullAction, typeof settings> = {
  id: "clue-full",
  title: "Clue / Cluedo (Full)",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "The full mansion: 6 suspects, 6 weapons, 9 rooms, secret passages, and a logbook autocompleter.",
  howToPlay: `Solve the murder before either CPU detective does.

Setup. One suspect, one weapon, and one room are sealed in the confidential envelope; the remaining 18 cards are dealt evenly to the three players. The cards in your hand are auto-marked as "ruled out" in your detective notebook.

Your turn. Click "Roll" to roll one 1d6. The board's nine rooms (Kitchen, Ballroom, Conservatory, Dining Room, Lounge, Hall, Study, Library, Billiard Room) are reachable through corridors; a roll of 6 lets you reach any room. If your pawn is in one of the four corner rooms with a secret passage (Kitchen <-> Study, Conservatory <-> Lounge) you may instead click "Take secret passage" to teleport — no die roll needed.

Suggest. Once inside a room, make a suggestion: pick a suspect and a weapon. The room is automatically your current room. Opponents in turn order check their hands; the first opponent holding any of the three cards must reveal one (you choose which when you're refuting). Cards shown to you are auto-recorded in the notebook.

Accuse. When you're confident, click "Accuse" and lock in suspect + weapon + room. A correct accusation wins; an incorrect one loses the game.

CPU opponents. Two CPU detectives play after you. They track every card they're shown, make plausible suggestions, and accuse when they've narrowed the envelope to exactly one suspect, one weapon, and one room.

Notebook. Click any row to cycle U (unknown) -> X (ruled out) -> ? (suspected) -> U.

Scoring. Win quickly to score higher (start at 100, lose 3 per turn taken). Wrong accusations or letting a CPU solve first scores 0.

Advanced rules omitted: tile-by-tile pawn movement on the corridor grid (we use a room adjacency graph), forcing other players' pawns during a suggestion, and the "Master Detective" intrigue cards.`,
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as ClueFullSettings),
  reducer,
  isTerminal,
  hint: (state: ClueFullState): HintTarget | null => {
    if (state.phase === "won" || state.phase === "lost") return null;
    if (state.turn !== 0) return null;
    switch (state.phase) {
      case "roll": {
        const partner = passagePartner(state.positions[0]);
        if (partner) return { selector: '[data-testid="clue-full-passage"]', pulses: 3 };
        return { selector: '[data-testid="clue-full-roll"]', pulses: 3 };
      }
      case "move":
        return { selector: '[data-testid^="clue-full-move-"]', pulses: 3 };
      case "suggest":
        return { selector: '[data-testid="clue-full-suggest"]', pulses: 3 };
      case "reveal":
        return { selector: '[data-testid^="clue-full-reveal-"]', pulses: 3 };
      case "accuse":
        return { selector: '[data-testid="clue-full-end-turn"]', pulses: 3 };
      default:
        return null;
    }
  },
  component: ClueFullGame,
};

export default clueFullPlugin;
