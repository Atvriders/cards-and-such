import type { GamePlugin, HintTarget, SettingsOf } from "../../platform/game-plugin/types.js";
import type { FlashpointRescueCoopState, FlashpointRescueCoopAction, FlashpointRescueCoopSettings } from "./state.js";
import { FlashpointRescueCoop_CFG, initialState, reducer, isTerminal } from "./state.js";
import { coopHintSelector } from "../_shared/coop-engine.js";
import { FlashpointRescueCoopGame } from "./Game.js";

const settings = {
  difficulty: { kind: "enum" as const, label: "Difficulty", options: ["Easy", "Standard", "Hard"] as const, default: "Standard" as const },
} as const;
type S = SettingsOf<typeof settings>;

export const flashpointRescueCoopPlugin: GamePlugin<FlashpointRescueCoopState, FlashpointRescueCoopAction, typeof settings> = {
  id: "flashpoint-rescue-coop",
  title: "Flash Point: Fire Rescue",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Firefighters rescue victims from a burning house.",
  howToPlay: "Flash Point: Fire Rescue is a cooperative solo adaptation. Each round you pick a tactic; you and an AI ally apply effort toward your objective while threat advances. Reach the target before threat overwhelms morale to win the bonus.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as FlashpointRescueCoopSettings),
  reducer,
  isTerminal,
  hint: (state: FlashpointRescueCoopState): HintTarget | null => {
    const sel = coopHintSelector(state, FlashpointRescueCoop_CFG);
    return sel ? { selector: sel, pulses: 3 } : null;
  },
  component: FlashpointRescueCoopGame,
};

export default flashpointRescueCoopPlugin;
