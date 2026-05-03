import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { captainIsDeadCoopState, captainIsDeadCoopAction, captainIsDeadCoopSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const captainIsDeadCoopGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.captainIsDeadCoopGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const captainIsDeadCoopPlugin: GamePlugin<captainIsDeadCoopState, captainIsDeadCoopAction, typeof settings> = {
  id: "captain-is-dead-coop",
  title: "Captain is Dead",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Cooperative ship crisis — keep starship systems online for ten rounds.",
  howToPlay: "Captain is Dead is a cooperative starship-crisis simulation distilled to ten dice rounds. The captain is gone, systems are failing, and your team must keep the ship online until rescue arrives.\n\nEach round, press Play Round. You and your AI engineer ally each roll a six-sided die; the sum (2-12) is added to your team score. Press Next Round to advance, Finish on round ten.\n\nThe target score is 70 — meet or exceed it across the ten rounds and the ship survives, awarding a +50 Rescue Bonus. Fall short and the rescue ship arrives too late.\n\nThe original Captain is Dead has eleven systems, alien attacks, and roles for up to seven players. This adaptation preserves the cooperative tension and rolled-survival arc without the system-by-system management. It's a quick crisis-feel game where every roll counts.\n\nAverage runs land near 70 — exactly at threshold. Lucky teams crest 80; unlucky teams stall at 60. Keep rolling, keep hoping, and hope the engineer pulls one through at the end.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as captainIsDeadCoopSettings),
  reducer, isTerminal, hint: (state: captainIsDeadCoopState): HintTarget | null => ((state.phase === "ready" || state.phase === "rolled") ? { selector: ".coop-btn", pulses: 3 } : null), component: captainIsDeadCoopGame,
};
