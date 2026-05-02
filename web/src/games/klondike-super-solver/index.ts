import type { GamePlugin } from "../../platform/game-plugin/types.js";
import { initialState, reducer, isTerminal } from "./state.js";
import type { KlondikeSuperSolverState, KlondikeSuperSolverAction, KlondikeSuperSolverSettings } from "./state.js";
import { KlondikeSuperSolver } from "./KlondikeSuperSolver.js";

const settings = {} as const;

export const klondikeSuperSolverPlugin: GamePlugin<KlondikeSuperSolverState, KlondikeSuperSolverAction, typeof settings> = {
  id: "klondike-super-solver",
  title: "Klondike — Super Solver",
  category: "solitaire",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Klondike with unlimited redeals, auto-foundation moves, and a hint system.",
  howToPlay: `Super Solver is an assisted Klondike variant designed to let you explore the full depth of the game without frustration.

Rules are standard Klondike: build seven tableau columns down in alternating colors (red on black), and send cards to the four foundations, one per suit, in order from Ace to King. Click the stock to draw one card at a time to the waste pile; the waste top is playable.

Super Solver adds three powerful tools. First, Redeal is unlimited — when the stock is exhausted, flip the waste back to the stock as many times as you need. This removes the pressure of a fixed pass limit, letting you focus on strategy. Second, the Auto→Found button automatically moves every legally ready card to its foundation in one click — no need to manually send 2s and 3s one at a time. Third, the Hint button analyzes the current position and suggests the strongest legal move available.

Despite the helpers, some deals can still stall if tableau columns become blocked. Use hints sparingly for a greater sense of accomplishment. Empty tableau columns accept Kings only — guard them carefully. Build foundations steadily but don't rush; leaving key cards on the tableau can unlock hidden sequences.`,
  settings,
  initialState: (seed: number, _settings: KlondikeSuperSolverSettings) => initialState(seed, _settings),
  reducer,
  isTerminal,
  hint: (state) => isTerminal(state) ? null : { selector: '[data-testid="play-restart-btn"]', pulses: 3 },
  component: KlondikeSuperSolver,
};
