import type { GamePlugin, HintTarget, SettingsOf } from "../../platform/game-plugin/types.js";
import type { kanoodlePegState, kanoodlePegAction, kanoodlePegSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { kanoodlePegGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const kanoodlePegPlugin: GamePlugin<kanoodlePegState, kanoodlePegAction, typeof settings> = {
  id: "kanoodle-peg",
  title: "Kanoodle",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Peg-puzzle observation — match colour-fit challenges to layouts.",
  howToPlay: "Kanoodle is a peg-puzzle colour-fit challenge distilled to fifteen layout-recognition rounds. Each round presents a partial peg arrangement and asks you to identify which configuration completes it.\n\nThe pool of peg-pattern challenges includes partial L-shapes, T-shapes, plus-shapes, and other classic Kanoodle puzzle layouts. Each correct answer scores ten points; max 150 across fifteen rounds.\n\nClick a configuration, press Submit to lock, then Next to advance. There's no timer — study each pattern carefully before choosing.\n\nThe original Kanoodle is a single-player peg puzzle with hundreds of challenges from easy to expert; physical pegs slot into a board to match shown layouts. This distillation captures the visual-pattern matching without the tactile peg-placement. Strong visual-spatial thinkers score 130+; expert puzzlers hit 150.\n\nUse it as a calm puzzle workout or as a visual warmup. The key skill is mentally rotating and translating patterns to find the right fit — and remembering which colour goes where.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as kanoodlePegSettings),
  reducer,
  isTerminal,
  
  hint: (state: kanoodlePegState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-kanoodle-peg-answer-0"]', pulses: 3 } : null,component: kanoodlePegGame,
};
