import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget, SettingsOf } from "../../platform/game-plugin/types.js";
import type {
  TrivialPursuitFullState,
  TrivialPursuitFullAction,
  TrivialPursuitFullSettings,
} from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";

const TrivialPursuitFullGame = /* @__PURE__ */ lazy(() =>
  import("./Game.js").then((mod) => ({
    default: mod.TrivialPursuitFullGame as unknown as React.ComponentType<unknown>,
  })),
);

const settings = {
  _dummy: { kind: "boolean" as const, label: "_dummy", default: false },
} as const;
type S = SettingsOf<typeof settings>;

export const trivialPursuitFullPlugin: GamePlugin<
  TrivialPursuitFullState,
  TrivialPursuitFullAction,
  typeof settings
> = {
  id: "trivial-pursuit-full",
  title: "Trivial Pursuit (Full Genus)",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "The full wedge-collection trivia board: 6 categories, 6 spokes, hub showdown vs. 3 CPU rivals.",
  howToPlay:
    "Trivial Pursuit (Full Genus) is the wheel-spinning, wedge-collecting board game. You play as Player 1 against three CPU opponents on a circular board with six color-coded category arms: Geography (blue), Entertainment (pink), History (yellow), Arts & Literature (brown), Science (green), and Sports (orange).\n\n" +
    "On your turn, press Roll Die to roll a six-sided die and move that many squares along the outer ring or down a spoke. The color of the square you land on determines the question category. Answer correctly to keep your turn; miss and the next player rolls. When you land on the special hexagonal HQ wedge square for a category and answer correctly, you win that category's wedge piece.\n\n" +
    "To win, collect all six wedges, reach the central hub, then answer one FINAL question on a random category. CPU opponents answer questions with roughly 60% accuracy.\n\n" +
    "Advanced rules omitted: branching path choices on every step (we auto-route between HQs and only prompt at HQ forks), specific spoke chosen when exiting the hub (we default to the first spoke), and house-rule wager/can-of-corn variants. The full deck of 150 questions covers all six categories.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as TrivialPursuitFullSettings),
  reducer,
  isTerminal,
  hint: (state: TrivialPursuitFullState): HintTarget | null => {
    if (isTerminal(state)) return null;
    if (state.turn !== 0) return null;
    if (state.phase === "rolling") return { selector: '[data-testid="hint-target-tpf-roll"]', pulses: 3 };
    if (state.phase === "question" || state.phase === "finalQuestion") {
      // Pulse the first answer as a generic hint affordance.
      return { selector: '[data-testid="hint-target-tpf-answer-0"]', pulses: 3 };
    }
    return null;
  },
  component: TrivialPursuitFullGame,
};

export default trivialPursuitFullPlugin;
