import type { GamePlugin, SettingsOf, HintTarget } from "../../platform/game-plugin/types.js";
import type { TimesTablesState, TimesTablesAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { TimesTablesGame } from "./Game.js";

export const timesTablesSettings = {
  tables: {
    kind: "enum" as const,
    label: "Tables",
    options: ["1-5", "1-10", "1-12"] as const,
    default: "1-10" as const,
  },
  questions: {
    kind: "enum" as const,
    label: "Questions",
    options: ["10", "20", "50"] as const,
    default: "10" as const,
  },
} as const;

type TimesTablesSettingsType = SettingsOf<typeof timesTablesSettings>;

export const timesTablesPlugin: GamePlugin<TimesTablesState, TimesTablesAction, typeof timesTablesSettings> = {
  id: "times-tables",
  title: "Times Tables",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Drill multiplication facts from the 1s through the 12s. Type the answer and press Enter to score.",
  howToPlay: `Times Tables drills your multiplication facts in a quick-fire typing format. A multiplication problem appears on screen — for example 7 × 8 = ? — and you type the answer into the input box, then press Enter or click the button to submit.

Each correct answer earns 10 points. Wrong answers score zero but still advance to the next question so you keep moving. Your correct count and running score are displayed at the top, and a progress bar shows how many questions remain in the round.

Use the Tables setting to control which multiplication tables are included. "1–5" restricts both factors to 1 through 5 (great for beginners). "1–10" covers the standard 10×10 grid. "1–12" extends to the full 12×12 table used in many school curricula.

The Questions setting lets you choose 10, 20, or 50 problems per round. Ten questions is a quick warm-up; 50 is a full workout.

Tips: Learn the commutative property — if you know 6 × 7, you also know 7 × 6. Focus on the tables you find hardest: 7s, 8s, and 9s trip people up most. The 9s trick: the digits of any 9× answer (up to 9×10) add up to 9. For example, 9 × 7 = 63, and 6 + 3 = 9.`,
  settings: timesTablesSettings,
  initialState: (seed: number, settings: TimesTablesSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (state: TimesTablesState): HintTarget | null => (state.phase === "playing" ? { selector: '[data-testid="hint-target-times-tables-primary"]', pulses: 3 } : null),
  component: TimesTablesGame,
};
