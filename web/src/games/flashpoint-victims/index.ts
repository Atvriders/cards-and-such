import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { FlashpointVictimsState, FlashpointVictimsAction, FlashpointVictimsSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { FlashpointVictimsGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const flashpointVictimsPlugin: GamePlugin<FlashpointVictimsState, FlashpointVictimsAction, typeof settings> = {
  id: "flashpoint-victims",
  title: "Flashpoint: Rescue Victims",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Cooperative firefighting variant — extra victims to rescue from collapse.",
  howToPlay: "Flashpoint: Rescue Victims is a cooperative firefighting variant focused on civilian rescue. You play a firefighter with an AI partner. Combined dice over ten rounds represent rescue actions and structural integrity.\n\nPress Play Round to enter the burning house. Then press Next Round, or Finish on round 10. Hit 65 to extinguish all fires and save every victim, claiming the Rescue Bonus.\n\nIn the boxed Flashpoint, fire spreads and structure tokens collapse; here we abstract into dice. Your AI partner bravely runs into the smoke. The Bonus rewards complete clears — leave no civilian behind. The roof is creaking, the smoke is thick, and only your rolls keep everyone alive.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as FlashpointVictimsSettings),
  reducer, isTerminal, component: FlashpointVictimsGame,
};
