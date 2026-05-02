import type { GamePlugin, HintTarget, SettingsOf } from "../../platform/game-plugin/types.js";
import type { CrewDeepSeaCoopState, CrewDeepSeaCoopAction, CrewDeepSeaCoopSettings } from "./state.js";
import { CrewDeepSeaCoop_CFG, initialState, reducer, isTerminal } from "./state.js";
import { coopHintSelector } from "../_shared/coop-engine.js";
import { CrewDeepSeaCoopGame } from "./Game.js";

const settings = {
  difficulty: { kind: "enum" as const, label: "Difficulty", options: ["Easy", "Standard", "Hard"] as const, default: "Standard" as const },
} as const;
type S = SettingsOf<typeof settings>;

export const crewDeepSeaCoopPlugin: GamePlugin<CrewDeepSeaCoopState, CrewDeepSeaCoopAction, typeof settings> = {
  id: "crew-deep-sea-coop",
  title: "The Crew: Deep Sea",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Trick-taking quest under the ocean.",
  howToPlay: "The Crew: Deep Sea is a cooperative solo adaptation. Each round you pick a tactic; you and an AI ally apply effort toward your objective while threat advances. Reach the target before threat overwhelms morale to win the bonus.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as CrewDeepSeaCoopSettings),
  reducer,
  isTerminal,
  hint: (state: CrewDeepSeaCoopState): HintTarget | null => {
    const sel = coopHintSelector(state, CrewDeepSeaCoop_CFG);
    return sel ? { selector: sel, pulses: 3 } : null;
  },
  component: CrewDeepSeaCoopGame,
};

export default crewDeepSeaCoopPlugin;
