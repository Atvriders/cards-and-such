import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { ScrabbleState, ScrabbleAction, ScrabbleSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";

const ScrabbleFullGameLazy = /* @__PURE__ */ lazy(() =>
  import("./Game.js").then((mod) => ({
    default: mod.ScrabbleFullGame as unknown as React.ComponentType<unknown>,
  })),
);

const settings = {
  difficulty: {
    kind: "enum" as const,
    label: "CPU Difficulty",
    options: ["easy", "medium", "hard"] as const,
    default: "medium" as const,
  },
} as const;

export const scrabbleFullPlugin: GamePlugin<ScrabbleState, ScrabbleAction, typeof settings> = {
  id: "scrabble-full",
  title: "Scrabble (Full Tournament)",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "The full TWL/SOWPODS-backed game with bingos, blanks, and a Quackle-tier AI.",
  howToPlay: `Scrabble (Full Tournament) is the classic word board game. You play 1-vs-CPU.

The 15x15 board has premium squares: TW (Triple Word, red), DW (Double Word, orange), TL (Triple Letter, dark blue), DL (Double Letter, light blue), and a center star where the first move must begin.

Each player draws 7 tiles from a 100-tile bag (98 letter tiles + 2 blanks). On your turn, click a tile from your rack to select it, then click an empty board square to place it. Continue until you've spelled a word, then press Submit. The first word must cover the center star.

Words must be at least 2 letters and form a connected line (horizontal or vertical). Every additional word you create through cross-letters must also be valid. Premium squares are scored only the turn the tile is placed on them. Playing all 7 tiles in a single move scores a 50-point Bingo bonus.

Blank tiles are wildcards: when you place one, a letter-picker appears. The blank scores 0 points but can stand for any letter. Click a placed blank to change its letter, or recall it back to your rack.

Other actions: Recall returns all your pending tiles to your rack. Pass skips your turn (6 consecutive passes ends the game). Exchange All swaps your unselected rack tiles for new ones from the bag (requires tiles remaining in the bag).

End of game: when the bag is empty AND a player empties their rack, the game ends. Each player's score is reduced by the point value of any tiles left in their rack; the player who rack-emptied receives those points as a bonus.

Note: this build uses a small embedded wordlist (a curated subset of common 2-7 letter English words), not the full TWL or SOWPODS lexicon. Many valid Scrabble words may not be recognized. The CPU also plays only from this same wordlist. Advanced rules omitted at this L-tier complexity: challenge mechanic, exchange edge-case validation (must have 7+ tiles in bag), and the full tournament lexicon.`,
  settings,
  initialState: (seed: number, s: ScrabbleSettings) => initialState(seed, s),
  reducer,
  isTerminal,
  hint: (state: ScrabbleState): HintTarget | null => {
    if (isTerminal(state)) return null;
    if (state.turn !== "human") return null;
    // Pulse the first unused rack tile to prompt the player to start placing
    for (let i = 0; i < state.humanRack.length; i++) {
      if (!state.pending.some((p) => p.rackIdx === i)) {
        return { selector: `[data-testid="scrabble-full-rack-${i}"]`, pulses: 3 };
      }
    }
    // If all tiles are pending, hint the submit button
    return { selector: '[data-testid="scrabble-full-submit"]', pulses: 3 };
  },
  component: ScrabbleFullGameLazy,
};
