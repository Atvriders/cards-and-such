import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { WelcomeDinolandState, WelcomeDinolandAction, WelcomeDinolandSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { WelcomeDinolandGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const welcomeDinolandPlugin: GamePlugin<WelcomeDinolandState, WelcomeDinolandAction, typeof settings> = {
  id: "welcome-dinoland",
  title: "Welcome to Dinoland",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Prehistoric park Welcome To with dinosaur enclosure scoring.",
  howToPlay: "Welcome to Dinoland is a Welcome To... variant set in a prehistoric park with dinosaur enclosure scoring. In this adaptation you build dinosaur enclosures on a 4x4 grid by rolling a single d6 each turn and assigning the value to an enclosure plot. Click Roll, then click any empty cell to mark it with the rolled number. You may Skip if the roll doesn't suit. Each marked plot scores its number directly. Strategy: complete rows and columns for +5 bonuses each, plus +10 for full park completion. Higher dice values improve raw scoring, but lower values are still useful for line-completion bonuses. After 12 rolls the game ends with bonuses applied. A solid Dinoland score is 32-46 points; an exceptional park-keeper who fills rows or columns can reach 60+. Each session brings a fresh prehistoric park puzzle thanks to seeded random rolls.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as WelcomeDinolandSettings),
  reducer,
  isTerminal,
  component: WelcomeDinolandGame,
};
