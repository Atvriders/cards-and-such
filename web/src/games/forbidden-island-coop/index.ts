import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { ForbiddenIslandCoopState, ForbiddenIslandCoopAction, ForbiddenIslandCoopSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { ForbiddenIslandCoopGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const forbiddenIslandCoopPlugin: GamePlugin<ForbiddenIslandCoopState, ForbiddenIslandCoopAction, typeof settings> = {
  id: "forbidden-island-coop",
  title: "Forbidden Island Co-op",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Cooperative race against a sinking island — claim treasure before the seas rise.",
  howToPlay: "Forbidden Island Co-op is a streamlined dice-based cooperative homage to Matt Leacock's modern classic. You and an AI ally roll together each round to gather treasure points. The team plays ten rounds with a shared target of 70 points to escape the sinking island in style.\n\nOn each round, press Play Round. Both dice tumble, and their sum is added to your team score. Press Next Round to advance, or Finish on round 10. Reach the 70-point target and the mission succeeds with a +50 bonus.\n\nThe original Forbidden Island has tile-flooding, helicopter lifts, and four artefacts to claim. This solo adaptation captures the cooperative tension: you and your partner pool every roll, with no individual scoring. The fate of you both is shared.\n\nIt's a quick, low-stakes way to feel like you've taken on Leacock's island in just a couple of minutes — sandbags optional, panic recommended.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as ForbiddenIslandCoopSettings),
  reducer, isTerminal, component: ForbiddenIslandCoopGame,
};
