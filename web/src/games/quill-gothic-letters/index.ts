import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, SettingsOf, HintTarget } from "../../platform/game-plugin/types.js";
import type { QuillGothicLettersState, QuillGothicLettersAction, QuillGothicLettersSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const QuillGothicLettersGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.QuillGothicLettersGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const quillGothicLettersPlugin: GamePlugin<QuillGothicLettersState, QuillGothicLettersAction, typeof settings> = {
  id: "quill-gothic-letters",
  title: "Quill: Gothic Letters",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Solo letter-writing homage; gothic horror correspondence.",
  howToPlay: "Quill: Gothic Letters is a solo journaling homage to Scott Malthouse's Quill: A Letter-Writing Roleplaying Game for a Single Player, here in the Gothic supplement style — letters between haunted manors, between mourners, between scholars who have read too far in the wrong books.\n\nAcross ten letter entries you choose tone, content, and what to confess versus what to leave unsigned. Each entry offers four weighted choices (A-D); your pick assigns a base reward plus 0-20 of mulberry32 variance. The original Quill uses heart, ink, and penmanship scores; this solo digital homage replaces those with prompt-and-roll while preserving the quiet candlelight tone.\n\nLetters are slower than telegrams. The dread accrues in transit. By the time the recipient opens the envelope, the writer may already be elsewhere — or nowhere.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as QuillGothicLettersSettings),
  reducer, isTerminal, hint: (state: QuillGothicLettersState): HintTarget | null => (state.phase === "choose" ? { selector: '[data-testid="hint-target-quill-gothic-letters-primary"]', pulses: 3 } : null), component: QuillGothicLettersGame,
};
