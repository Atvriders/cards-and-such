import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { ForbiddenSkyCoopState, ForbiddenSkyCoopAction, ForbiddenSkyCoopSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { ForbiddenSkyCoopGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const forbiddenSkyCoopPlugin: GamePlugin<ForbiddenSkyCoopState, ForbiddenSkyCoopAction, typeof settings> = {
  id: "forbidden-sky-coop",
  title: "Forbidden Sky Co-op",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Cooperative dice circuit-completion above the storm clouds.",
  howToPlay: "Forbidden Sky Co-op puts you on a floating platform alongside an AI ally. Across ten rounds, you both roll dice and pool the results to power a great circuit before lightning strikes. Reach 70 points to escape successfully and earn a 50-point bonus.\n\nPress Play Round each turn. Two dice roll, their sum joins your team score. Press Next Round to advance, or Finish on round 10. There is no penalty for falling short of 70 — you simply don't get the bonus.\n\nThe original Forbidden Sky features actual electric circuits to wire as you play, an iconic gimmick from Matt Leacock. This compact dice version cannot replicate the sparks but it preserves the urgent cooperation: every roll is shared, every round matters, and the stormy aesthetic energises the simple math.\n\nStrap in, raise your antennas, and survive the lightning together — assuming the rolls cooperate.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as ForbiddenSkyCoopSettings),
  reducer, isTerminal, component: ForbiddenSkyCoopGame,
};
