import type { GamePlugin, HintTarget, SettingsOf } from "../../platform/game-plugin/types.js";
import type { HogwartsVillainCoopState, HogwartsVillainCoopAction, HogwartsVillainCoopSettings } from "./state.js";
import { HogwartsVillainCoop_CFG, initialState, reducer, isTerminal } from "./state.js";
import { coopHintSelector } from "../_shared/coop-engine.js";
import { HogwartsVillainCoopGame } from "./Game.js";

const settings = {
  difficulty: { kind: "enum" as const, label: "Difficulty", options: ["Easy", "Standard", "Hard"] as const, default: "Standard" as const },
} as const;
type S = SettingsOf<typeof settings>;

export const hogwartsVillainCoopPlugin: GamePlugin<HogwartsVillainCoopState, HogwartsVillainCoopAction, typeof settings> = {
  id: "hogwarts-villain-coop",
  title: "Hogwarts Battle: Villains",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Villain-only deck Hogwarts Battle variant.",
  howToPlay: "Hogwarts Battle: Villains is a cooperative solo adaptation. Each round you pick a tactic; you and an AI ally apply effort toward your objective while threat advances. Reach the target before threat overwhelms morale to win the bonus.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as HogwartsVillainCoopSettings),
  reducer,
  isTerminal,
  hint: (state: HogwartsVillainCoopState): HintTarget | null => {
    const sel = coopHintSelector(state, HogwartsVillainCoop_CFG);
    return sel ? { selector: sel, pulses: 3 } : null;
  },
  component: HogwartsVillainCoopGame,
};

export default hogwartsVillainCoopPlugin;
