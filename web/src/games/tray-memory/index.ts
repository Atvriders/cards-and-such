import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { TrayMemoryState, TrayMemoryAction, TrayMemorySettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { TrayMemoryGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const trayMemoryPlugin: GamePlugin<TrayMemoryState, TrayMemoryAction, typeof settings> = {
  id: "tray-memory", title: "Tray Memory", category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Tray-of-objects memory with scoring rounds.",
  howToPlay: "Tray Memory is Kim's Game with a tighter scoring system. Ten rounds, six items per tray, 3.5-second study window before the tray hides and the question appears. Each prompt shows a candidate item and asks if it appeared on the tray; pick the matching YES or NO phrasing from four candidates. Two distractor phrasings are added per round to test reading attention. Correct answers score ten points; max 100 total across ten rounds. The item pool draws from a 24-symbol set (umbrellas, telephones, scissors, suits, marks, weather symbols) varied to test different cognitive paths — verbal labels, color, shape, conceptual category. Tray Memory differs from classic Kim's Game by formalising the recall as a multiple-choice question, making it self-grading. Use as a brain warm-up, classroom observation lesson, or attention-training session. After the tray fades, your job is purely yes-or-no — but distractor phrasings keep you honest. Hit Submit, then Next to advance.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as TrayMemorySettings),
  reducer, isTerminal, hint: (state: TrayMemoryState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-tray-memory-answer-0"]', pulses: 3 } : null, component: TrayMemoryGame,
};
