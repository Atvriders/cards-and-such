import type { GamePlugin, HintTarget, SettingsOf } from "../../platform/game-plugin/types.js";
import type { DominionSeasideState, DominionSeasideAction, DominionSeasideSettings } from "./state.js";
import { DominionSeaside_CFG, initialState, reducer, isTerminal } from "./state.js";
import { coopHintSelector } from "../_shared/coop-engine.js";
import { DominionSeasideGame } from "./Game.js";

const settings = {
  difficulty: { kind: "enum" as const, label: "Difficulty", options: ["Easy", "Standard", "Hard"] as const, default: "Standard" as const },
} as const;
type S = SettingsOf<typeof settings>;

export const dominionSeasidePlugin: GamePlugin<DominionSeasideState, DominionSeasideAction, typeof settings> = {
  id: "dominion-seaside",
  title: "Dominion: Seaside",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Duration-card Dominion expansion.",
  howToPlay: "Dominion: Seaside is a cooperative solo adaptation. Each round you pick a tactic; you and an AI ally apply effort toward your objective while threat advances. Reach the target before threat overwhelms morale to win the bonus.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as DominionSeasideSettings),
  reducer,
  isTerminal,
  hint: (state: DominionSeasideState): HintTarget | null => {
    const sel = coopHintSelector(state, DominionSeaside_CFG);
    return sel ? { selector: sel, pulses: 3 } : null;
  },
  component: DominionSeasideGame,
};

export default dominionSeasidePlugin;
