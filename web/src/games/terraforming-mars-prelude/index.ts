import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { TerraformingMarsPreludeState, TerraformingMarsPreludeAction, TerraformingMarsPreludeSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { TerraformingMarsPreludeGame } from "./Game.js";

const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const terraformingMarsPreludePlugin: GamePlugin<TerraformingMarsPreludeState, TerraformingMarsPreludeAction, typeof settings> = {
  id: "terraforming-mars-prelude",
  title: "Terraforming Mars: Prelude",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Draft prelude cards to jump-start Terraforming Mars engine.",
  howToPlay: "Terraforming Mars: Prelude is a draft of opening prelude cards across eight rounds. Each prelude is a corp boost — energy, plant, heat, or steel resource.\n\nEach round, three cards appear: pick one and the CPU takes the highest-rank remaining. Suits represent the four prelude resource paths.\n\nScoring per tableau:\n- Sum of prelude card ranks (resource quantity, 1-9 each).\n- +10 per resource type with 3+ cards (engine specialization).\n- +15 additional per resource type with 5+ cards.\n- +5 per same-rank pair; +10 per triplet.\n- +25 if you outscore the CPU.\n\nStrategy: in real Terraforming Mars, preludes lock your early game. Here, drafting one resource heavily (3+ steel) earns +10 — pursue specialization unless the CPU starves you. The greedy CPU helps you: it ignores rank-2 plants while you stockpile them. Aim for 60-100 points. Prelude is the engine-builder's favourite expansion, distilled into 8 sharp drafting decisions.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as TerraformingMarsPreludeSettings),
  reducer,
  isTerminal,
  component: TerraformingMarsPreludeGame,
};
