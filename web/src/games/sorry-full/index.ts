import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, SettingsOf, HintTarget } from "../../platform/game-plugin/types.js";
import type { SorryFullState, SorryFullAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";

const SorryFull = /* @__PURE__ */ lazy(() =>
  import("./Game.js").then((mod) => ({
    default: mod.SorryFull as unknown as React.ComponentType<unknown>,
  })),
);

export const sorryFullSettings = {
  mode: {
    kind: "enum" as const,
    label: "Game Mode",
    options: ["solo", "partners"] as const,
    default: "solo" as const,
  },
  difficulty: {
    kind: "enum" as const,
    label: "Bot Difficulty",
    options: ["easy", "normal"] as const,
    default: "normal" as const,
  },
} as const;

type SorryFullSettingsType = SettingsOf<typeof sorryFullSettings>;

export const sorryFullPlugin: GamePlugin<SorryFullState, SorryFullAction, typeof sorryFullSettings> = {
  id: "sorry-full",
  title: "Sorry! (Full)",
  category: "board",
  players: { min: 1, max: 4, multiplayer: false },
  description: "The complete card-driven race with slide chains, swap cards, and 2v2 partners mode.",
  howToPlay: `Sorry! is a classic card-and-pawn race. You play the red corner (seat 0); three CPUs play blue, yellow, and green. The full rulebook is implemented here.

BOARD. A 60-square outer ring connects four corners. Each color has a START yard, a 5-square SAFETY zone, and a HOME. Pawns leave START with a 1, 2, or Sorry! card; advance clockwise; turn off into their own SAFETY zone, then HOME.

CARDS (5 of each 1, 2, 3, 4, 5, 7, 8, 10, 11, 12 + 4 Sorry!):
- 1: bring a pawn out of START, or move 1 forward.
- 2: bring a pawn out of START, or move 2 forward. Then draw again.
- 3, 5, 8, 12: move that many spaces forward.
- 4: move BACK 4. (Useful — backward into safety is not allowed; backward stays on the ring.)
- 7: move 7 forward OR split 7 between two of your pawns (e.g. 3+4).
- 10: move 10 forward OR 1 backward.
- 11: move 11 forward OR swap places with any opponent on the ring (not in safety/yard/home).
- Sorry!: place a START pawn directly on any opponent pawn on the ring, sending them home.

SLIDES. Each color side has two arrow-marked slides. If you land on the START of a slide that isn't your color, you ride to the end of the arrow and every pawn (yours or opponent's) along the slide is bumped back to its yard. Brutal — and chainable when slide ends land on slide starts.

BUMPING. Landing on an opponent's pawn (or on a non-own slide) sends it back to its yard. You cannot land on your own pawn.

PARTNERS MODE. Optional 2v2: seats 0+2 vs 1+3. The team that gets all 8 pawns home wins. You may not Sorry! or Swap a partner — only opposing-team pawns.

WINNING. Solo: first to home all four pawns wins. Partners: first team to home all eight pawns wins.

If you draw a card with no legal play, the turn passes automatically.`,
  settings: sorryFullSettings,
  initialState: (seed: number, settings: SorryFullSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (state: SorryFullState): HintTarget | null => {
    if (isTerminal(state) !== null) return null;
    if (state.turn !== 0) return null;
    if (state.phase === "drawing") return { selector: '[data-testid="sf-draw"]', pulses: 3 };
    if (state.phase === "choosing" || state.phase === "splitting") {
      return { selector: '[data-testid="sf-action"]', pulses: 3 };
    }
    return null;
  },
  component: SorryFull,
};
