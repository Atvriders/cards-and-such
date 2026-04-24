import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { TODState, TODAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { TruthOrDare } from "./Game.js";

export const truthOrDareSettings = {
  rounds: {
    kind: "enum" as const,
    label: "Rounds",
    options: ["10", "20", "30"] as const,
    default: "20" as const,
  },
  mode: {
    kind: "enum" as const,
    label: "Mode",
    options: ["family", "party"] as const,
    default: "family" as const,
  },
} as const;

type TODSettingsType = SettingsOf<typeof truthOrDareSettings>;

export const truthOrDarePlugin: GamePlugin<TODState, TODAction, typeof truthOrDareSettings> = {
  id: "truth-or-dare",
  title: "Truth or Dare",
  category: "cards",
  players: { min: 2, max: 12, multiplayer: false },
  description: "Classic party game — choose Truth or Dare each round!",
  howToPlay: `Truth or Dare is the ultimate party icebreaker that has stood the test of time. Players take turns choosing between answering a question honestly (Truth) or completing a physical or social challenge (Dare).

Each round, the current player sees two big buttons: Truth and Dare. They tap their choice, and a prompt appears on screen for them to act on. When finished, they tap "Done" to pass to the next player.

Truth prompts range from mildly embarrassing to genuinely revealing. Dare prompts are silly, social, or physical challenges designed to get everyone laughing.

Family mode keeps everything age-appropriate and fun for all. Party mode adds edgier truths and dares for adult groups.

Tips for a great game: set a rule that refusing a prompt costs a forfeit (like answering the other option anyway). The best moments come when people actually commit to their dares!

Pass the device clockwise after each round. There is no winner — just a group of people who know each other much better (and have embarrassing stories about each other) by the end.`,
  settings: truthOrDareSettings,
  initialState: (seed: number, settings: TODSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  component: TruthOrDare,
};
