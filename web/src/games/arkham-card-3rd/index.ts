import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { arkhamCardThirdState, arkhamCardThirdAction, arkhamCardThirdSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { arkhamCardThirdGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const arkhamCardThirdPlugin: GamePlugin<arkhamCardThirdState, arkhamCardThirdAction, typeof settings> = {
  id: "arkham-card-3rd",
  title: "Arkham Horror (Card 3rd Ed)",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Third-edition Arkham Horror — investigators face the Ancient One over ten rounds.",
  howToPlay: "Arkham Horror (Card 3rd Edition) is the cooperative Lovecraftian investigation distilled to ten dice rounds. You and a fellow investigator roll over ten rounds, building doom-against-doom score against the awakening Ancient One.\n\nEach round, press Play Round. Two dice tumble and their sum (2-12) joins the team's investigation score. Press Next Round to advance, Finish on round ten.\n\nThe banishment target is 70. Hit it and the gate is sealed, awarding a +50 Banishment Bonus. Miss it and Arkham wakes screaming from a cosmic nightmare — but you fought the good fight.\n\nThe original Arkham Horror Third Edition has scenarios, gates, monster spawns, and intricate spell decks. This distillation preserves the cooperative investigation tension across ten rounds without the scenario-by-scenario complexity. A solid investigation scores around 70; a heroic seal pushes 80+; an unlucky one ends in cosmic horror at 60.\n\nKeep rolling — Arkham depends on you.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as arkhamCardThirdSettings),
  reducer, isTerminal, hint: (state: arkhamCardThirdState): HintTarget | null => ((state.phase === "ready" || state.phase === "rolled") ? { selector: ".coop-btn", pulses: 3 } : null), component: arkhamCardThirdGame,
};
