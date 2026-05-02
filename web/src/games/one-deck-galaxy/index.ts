import type { GamePlugin, HintTarget, SettingsOf } from "../../platform/game-plugin/types.js";
import type { OneDeckGalaxyState, OneDeckGalaxyAction, OneDeckGalaxySettings } from "./state.js";
import { OneDeckGalaxy_CFG, initialState, reducer, isTerminal } from "./state.js";
import { coopHintSelector } from "../_shared/coop-engine.js";
import { OneDeckGalaxyGame } from "./Game.js";

const settings = {
  difficulty: { kind: "enum" as const, label: "Difficulty", options: ["Easy", "Standard", "Hard"] as const, default: "Standard" as const },
} as const;
type S = SettingsOf<typeof settings>;

export const oneDeckGalaxyPlugin: GamePlugin<OneDeckGalaxyState, OneDeckGalaxyAction, typeof settings> = {
  id: "one-deck-galaxy",
  title: "One Deck Galaxy",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Pocket 4X with one deck.",
  howToPlay: "One Deck Galaxy is a cooperative solo adaptation. Each round you pick a tactic; you and an AI ally apply effort toward your objective while threat advances. Reach the target before threat overwhelms morale to win the bonus.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as OneDeckGalaxySettings),
  reducer,
  isTerminal,
  hint: (state: OneDeckGalaxyState): HintTarget | null => {
    const sel = coopHintSelector(state, OneDeckGalaxy_CFG);
    return sel ? { selector: sel, pulses: 3 } : null;
  },
  component: OneDeckGalaxyGame,
};

export default oneDeckGalaxyPlugin;
