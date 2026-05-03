import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { DigitSpanState, DigitSpanAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { DigitSpan } from "./DigitSpan.js";

export const digitSpanSettings = {
  mode: {
    kind: "enum" as const,
    label: "Mode",
    options: ["forward", "backward"] as const,
    default: "forward" as const,
  },
  startLength: {
    kind: "enum" as const,
    label: "Start Length",
    options: ["3", "4", "5"] as const,
    default: "3" as const,
  },
} as const;

type DigitSpanSettingsType = SettingsOf<typeof digitSpanSettings>;

export const digitSpanPlugin: GamePlugin<DigitSpanState, DigitSpanAction, typeof digitSpanSettings> = {
  id: "digit-span",
  title: "Digit Span",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Digits flash one at a time. Recall them in order (or reverse order). Span grows each correct round.",
  howToPlay: `Digits flash on screen one at a time. After the sequence ends, use the number pad to enter what you saw — in the same order for forward mode, or backwards for backward mode.

Each correct round increases the sequence length by one. If you enter the wrong sequence, you lose a life. You have three lives. When all lives are gone, the game ends and your score is calculated.

Your score is based on how many rounds you answered correctly plus the final span length you reached. Reaching a longer span length is worth bonus points even if your round count is similar.

Start length controls how many digits you begin with — 3, 4, or 5. Forward mode is the classic digit span test used in IQ and working memory assessments. Backward mode adds extra cognitive load because you must mentally reverse the sequence before entering it.

Tips: Chunking helps enormously. Group digits into pairs or triples and associate them with familiar numbers — phone numbers, years, scores. Say the digits aloud quietly as they flash. In backward mode, visualize writing the sequence on a whiteboard and reading it in reverse. The average human working memory span is 7 digits; reaching 8 or more is exceptional.`,
  settings: digitSpanSettings,
  initialState: (seed: number, settings: DigitSpanSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "done" || p === "gameover" || p === "ended" || p === "finished" || (s as any).gameOver || (s as any).won || (s as any).complete || (s as any).isComplete) return null; return { selector: ".ds-next-btn", pulses: 3 }; },
  component: DigitSpan,
};
