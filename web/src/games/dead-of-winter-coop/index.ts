import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, SettingsOf, HintTarget } from "../../platform/game-plugin/types.js";
import type { deadOfWinterCoopState, deadOfWinterCoopAction, deadOfWinterCoopSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const deadOfWinterCoopGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.deadOfWinterCoopGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const deadOfWinterCoopPlugin: GamePlugin<deadOfWinterCoopState, deadOfWinterCoopAction, typeof settings> = {
  id: "dead-of-winter-coop",
  title: "Dead of Winter (Co-op)",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Semi-cooperative survival — crossroad dilemmas across ten rounds.",
  howToPlay: "Dead of Winter (Co-op) is a semi-cooperative zombie-apocalypse survival distilled to ten dice rounds. You and your fellow survivor face ten rounds of harsh winter, rolling dice as the colony's resources tighten.\n\nEach round, press Play Round. Two dice tumble and their sum (2-12) joins your survival score. Press Next Round to advance, Finish on round ten.\n\nThe colony survival target is 70. Hit it and the colony survives the winter with a +50 Spring Arrives bonus. Fall short and the cold takes you, but you fought the long winter.\n\nThe original Dead of Winter has crossroad cards, betrayer mechanics, and a sprawling map of locations. This distillation preserves the cooperative ten-round survival arc without the betrayal subsystem (you and your ally are reliable here). Solid winters score around 70; resilient colonies push 80+; tough ones stall at 60.\n\nThe zombies are ten rounds away; let the dice decide if your colony makes it to spring.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as deadOfWinterCoopSettings),
  reducer, isTerminal, hint: (state: deadOfWinterCoopState): HintTarget | null => ((state.phase === "ready" || state.phase === "rolled") ? { selector: ".coop-btn", pulses: 3 } : null), component: deadOfWinterCoopGame,
};
