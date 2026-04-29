import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { SpaceAlertCoopState, SpaceAlertCoopAction, SpaceAlertCoopSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { SpaceAlertCoopGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const spaceAlertCoopPlugin: GamePlugin<SpaceAlertCoopState, SpaceAlertCoopAction, typeof settings> = {
  id: "space-alert-coop",
  title: "Space Alert Coop",
  category: "dice",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Real-time cooperative; preprogram crew actions.",
  howToPlay: "Space Alert Coop is a ten-round cooperative dice tribute to Vlaada Chvátil's Space Alert, the real-time cooperative game where players preprogram crew actions. You and an AI crew-mate ally roll dice each round to handle starship crises. Team target is 70 across 10 rounds. 🛸\n\nEach round both dice are rolled and summed, with the sum added to your team score. Reach 70 by round 10 and the ship survives with a +50 cooperative bonus. Per-round averages around 7 mean ten rounds usually meet the target.\n\nPress Play Round to roll, Next Round to advance, and Finish on round 10. The game completes in well under a minute. It distills Space Alert's frantic cooperative real-time tension into a calm, turn-based pocket session that still captures the all-hands-on-deck cooperative spirit of the original even within its abstracted dice-only form.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as SpaceAlertCoopSettings),
  reducer, isTerminal, component: SpaceAlertCoopGame,
};
