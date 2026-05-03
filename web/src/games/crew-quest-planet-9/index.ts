import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget, SettingsOf } from "../../platform/game-plugin/types.js";
import type { CrewQuestPlanet9State, CrewQuestPlanet9Action, CrewQuestPlanet9Settings } from "./state.js";
import { CrewQuestPlanet9_CFG, initialState, reducer, isTerminal } from "./state.js";
import { coopHintSelector } from "../_shared/coop-engine.js";
const CrewQuestPlanet9Game = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.CrewQuestPlanet9Game as unknown as React.ComponentType<unknown> })));
const settings = {
  difficulty: { kind: "enum" as const, label: "Difficulty", options: ["Easy", "Standard", "Hard"] as const, default: "Standard" as const },
} as const;
type S = SettingsOf<typeof settings>;

export const crewQuestPlanet9Plugin: GamePlugin<CrewQuestPlanet9State, CrewQuestPlanet9Action, typeof settings> = {
  id: "crew-quest-planet-9",
  title: "The Crew: Planet Nine",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Trick-taking quest to find Planet 9.",
  howToPlay: "The Crew: Planet Nine is a cooperative solo adaptation. Each round you pick a tactic; you and an AI ally apply effort toward your objective while threat advances. Reach the target before threat overwhelms morale to win the bonus.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as CrewQuestPlanet9Settings),
  reducer,
  isTerminal,
  hint: (state: CrewQuestPlanet9State): HintTarget | null => {
    const sel = coopHintSelector(state, CrewQuestPlanet9_CFG);
    return sel ? { selector: sel, pulses: 3 } : null;
  },
  component: CrewQuestPlanet9Game,
};

export default crewQuestPlanet9Plugin;
