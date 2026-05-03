import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { vastManorCoopState, vastManorCoopAction, vastManorCoopSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { vastManorCoopGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const vastManorCoopPlugin: GamePlugin<vastManorCoopState, vastManorCoopAction, typeof settings> = {
  id: "vast-manor-coop",
  title: "Vast: The Mysterious Manor",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Asymmetric cooperative haunted-house — ghosts, paladin, and skeletons over ten rounds.",
  howToPlay: "Vast: The Mysterious Manor is an asymmetric cooperative haunted-house dungeon-crawl distilled to ten dice rounds. You and your AI ally play paladin and ghost respectively, working through ten rounds in the manor.\n\nEach round, press Play Round. Two dice (yours and the ghost's) tumble; the sum (2-12) joins your shared score. Press Next Round to advance, Finish on round ten.\n\nThe survival target is 70. Hit it and the manor ghost is exorcised with a +50 Manor Cleansed bonus. Miss it and you wander the halls together, unscored but undefeated.\n\nThe original Vast: The Mysterious Manor has five asymmetric roles (paladin, skeletons, spider, ghost, manor itself) and complex room-revealing mechanics. This distillation captures the cooperative survival-rolling feel without role asymmetry — both players just roll dice each round.\n\nA solid haunting scores around 70; a heroic run pushes 80+; an unlucky pair stalls at 60. Keep the dice rolling and hope the spirits cooperate.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as vastManorCoopSettings),
  reducer, isTerminal, hint: (state: vastManorCoopState): HintTarget | null => ((state.phase === "ready" || state.phase === "rolled") ? { selector: ".coop-btn", pulses: 3 } : null), component: vastManorCoopGame,
};
