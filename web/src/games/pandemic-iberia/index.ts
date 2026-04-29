import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { PandemicIberiaState, PandemicIberiaAction, PandemicIberiaSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { PandemicIberiaGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const pandemicIberiaPlugin: GamePlugin<PandemicIberiaState, PandemicIberiaAction, typeof settings> = {
  id: "pandemic-iberia",
  title: "Pandemic Iberia",
  category: "dice",
  players: { min: 1, max: 1, multiplayer: false },
  description: "1848 Spain; purify water and build railways.",
  howToPlay: "Pandemic Iberia is a ten-round cooperative dice tribute to Pandemic: Iberia, the 1848-set Spanish Pandemic where players purify water and build railways. You and an AI engineer ally roll dice each round to combat disease across Iberia. Team target is 70 across 10 rounds. 🚂\n\nEach round both dice are rolled and summed, with that sum added to your team score. Reach 70 by round 10 and Iberia is saved with a +50 cooperative bonus. Per-round averages cluster around 7 points; ten rounds typically clear the target.\n\nPress Play Round to roll both dice, then Next Round to advance, and Finish on round 10. The game completes in well under a minute. It captures the historical-Pandemic flavour in a fast, replayable form — perfect for a brief cooperative cooperative session anytime. Try repeated runs to chase the highest possible cooperative score with bonus.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as PandemicIberiaSettings),
  reducer, isTerminal, component: PandemicIberiaGame,
};
