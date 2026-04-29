import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { ArkhamLcgFellowState, ArkhamLcgFellowAction, ArkhamLcgFellowSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { ArkhamLcgFellowGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const arkhamLcgFellowPlugin: GamePlugin<ArkhamLcgFellowState, ArkhamLcgFellowAction, typeof settings> = {
  id: "arkham-lcg-fellow",
  title: "Arkham LCG: Fellow Investigator",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Arkham LCG variant — fellow investigator card draws drive Lovecraftian dread.",
  howToPlay: "Arkham LCG: Fellow Investigator is a cooperative variant where you and your AI investigator pool clues across ten rounds of mythos exposure. The combined dice represent skill checks: investigation, willpower, agility. High rolls keep the dread at bay; low rolls let madness creep in.\n\nPress Play Round to attempt a skill check. Then press Next Round, or Finish on round 10. Hit 75 points to seal the gate and earn the Investigator's Wisdom bonus.\n\nIn the official LCG, deck construction matters intensely; here we simulate it via shared dice luck. Your fellow investigator brings their own quirks — sometimes a brilliant insight, sometimes a fumbled tome. Either way, you face the unknown together. Survive sanity. Survive the mythos. Earn the bonus.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as ArkhamLcgFellowSettings),
  reducer, isTerminal, component: ArkhamLcgFellowGame,
};
