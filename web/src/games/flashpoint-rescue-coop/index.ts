import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { FlashpointRescueCoopState, FlashpointRescueCoopAction, FlashpointRescueCoopSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { FlashpointRescueCoopGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const flashpointRescueCoopPlugin: GamePlugin<FlashpointRescueCoopState, FlashpointRescueCoopAction, typeof settings> = {
  id: "flashpoint-rescue-coop",
  title: "Flashpoint Fire Rescue Co-op",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Cooperative firefighter homage — rescue victims before structural collapse.",
  howToPlay: "Flashpoint Fire Rescue Co-op tributes Indie Boards & Cards' beloved cooperative firefighting game by Kevin Lanzing. You and an AI firefighter ally tackle ten rounds of rescue ops, rolling dice each round to represent action points spent saving victims. Reach 70 team points to save enough lives and earn a 50-point bonus.\n\nPress Play Round each turn. Both dice resolve and their sum joins your team score. Press Next Round to continue, Finish on round 10.\n\nFlashpoint's full game features fire spread, smoke conversion, hazardous materials, and structural damage that can collapse the entire building. This solo adaptation removes the spreading-fire mechanism but keeps the cooperative spirit — every action serves both firefighters, and any rescue is shared.\n\nImagine the heat, the alarms, and the urgency. The original Flashpoint earned a reputation as one of the friendliest entry points to cooperative gaming, and this dice version honours that approachable warmth.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as FlashpointRescueCoopSettings),
  reducer, isTerminal, component: FlashpointRescueCoopGame,
};
