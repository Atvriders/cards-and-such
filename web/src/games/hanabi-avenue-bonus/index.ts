import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { HanabiAvenueBonusState, HanabiAvenueBonusAction, HanabiAvenueBonusSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { HanabiAvenueBonusGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const hanabiAvenueBonusPlugin: GamePlugin<HanabiAvenueBonusState, HanabiAvenueBonusAction, typeof settings> = {
  id: "hanabi-avenue-bonus",
  title: "Hanabi: Avenue Bonus",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Hanabi promotion variant — correctly placed fireworks earn avenue bonuses.",
  howToPlay: "Hanabi: Avenue Bonus is a tribute to the cooperative clue-giving fireworks game with a promotion twist. You and your AI partner take turns selecting which colour to focus on. Each round both players reveal their card and the combined value is added to the team avenue track. Hit 60 by round 10 to win an extra promotion fanfare.\n\nPress Play Round to reveal your fireworks. Then press Next Round, or Finish on round 10. The avenue bonus rewards perfect plays — every roll above seven contributes a small fanfare token.\n\nHanabi tradition asks players to keep their own cards hidden and to give limited clues; this distillation keeps the cooperative trust without the table-talk. You depend on the AI partner like a careful pyrotechnician depends on the assistant — silent, attentive, ready. Light up the boulevard.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as HanabiAvenueBonusSettings),
  reducer, isTerminal, component: HanabiAvenueBonusGame,
};
