import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { ForbiddenDesertCoopState, ForbiddenDesertCoopAction, ForbiddenDesertCoopSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { ForbiddenDesertCoopGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const forbiddenDesertCoopPlugin: GamePlugin<ForbiddenDesertCoopState, ForbiddenDesertCoopAction, typeof settings> = {
  id: "forbidden-desert-coop",
  title: "Forbidden Desert Co-op",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Cooperative dice scramble through a sandstorm to assemble an airship.",
  howToPlay: "Forbidden Desert Co-op channels the sand-and-storm sequel to Forbidden Island. You and an AI ally roll dice across ten rounds, pooling totals to assemble enough airship parts (in points) to escape before water runs out.\n\nPress Play Round each round. The two dice show their numbers and their sum joins your shared team score. Press Next Round to continue, Finish on round 10. Hit 70 to escape successfully with a 50-point bonus.\n\nForbidden Desert in its original form features wind direction, sandstorm cards, gear, and characters with unique powers. This compact solo version keeps the cooperative spirit and mission tension while reducing the rules to a quick dice exercise.\n\nEvery round you bond with your AI ally as the imaginary winds shift overhead. A strong opening usually means a relaxed close; a brutal start means a desperate finish. Roll well, dig faster, fly home.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as ForbiddenDesertCoopSettings),
  reducer, isTerminal, component: ForbiddenDesertCoopGame,
};
