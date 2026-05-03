import type { GamePlugin, SettingsOf, HintTarget } from "../../platform/game-plugin/types.js";
import type { RemnantsFragmentsState, RemnantsFragmentsAction, RemnantsFragmentsSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { RemnantsFragmentsGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const remnantsFragmentsPlugin: GamePlugin<RemnantsFragmentsState, RemnantsFragmentsAction, typeof settings> = {
  id: "remnants-fragments",
  title: "Remnants: Fragments",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Solo journaling homage; reconstructing a destroyed world.",
  howToPlay: "Remnants: Fragments is a solo journaling homage to the Remnants tradition of post-apocalyptic journaling games where a survivor reconstructs a destroyed world from scattered objects, half-overheard rumors, and dreams that may or may not be memories.\n\nAcross ten fragment entries you choose what each found object remembers, what each rumor confirms, and what each dream insists on. Each entry offers four weighted choices (A-D); your pick assigns a base reward plus 0-20 of mulberry32 variance.\n\nThe original Remnants uses prompt cards and a journal kept across many evenings. This solo digital homage compresses the slow assembly into a single sitting while preserving the salvage-and-reconstruct tone of holding history together with old string.\n\nThe world is gone. The fragments remain. The fragments are how the world goes on.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as RemnantsFragmentsSettings),
  reducer, isTerminal, hint: (state: RemnantsFragmentsState): HintTarget | null => (state.phase === "choose" ? { selector: '[data-testid="hint-target-remnants-fragments-primary"]', pulses: 3 } : null), component: RemnantsFragmentsGame,
};
