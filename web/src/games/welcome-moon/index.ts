import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { WelcomeMoonState, WelcomeMoonAction, WelcomeMoonSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { WelcomeMoonGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const welcomeMoonPlugin: GamePlugin<WelcomeMoonState, WelcomeMoonAction, typeof settings> = {
  id: "welcome-moon",
  title: "Welcome to the Moon",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Lunar Welcome To campaign with narrative arcs across mission sheets.",
  howToPlay: "Welcome to the Moon is a campaign Welcome To... game with narrative arcs across eight mission sheets. In this adaptation you complete a single lunar mission on a 4x4 grid by rolling a single d6 each turn and assigning the value to a moonbase cell. Click Roll, then click any empty cell to mark it with the rolled number. You may Skip if the roll doesn't suit your mission plan. Each marked cell adds its value to your score. Strategy: aim for row and column completions (+5 each) and the full-base bonus (+10). The narrative theme rewards thinking ahead — early high rolls fill premium cells, later low rolls can finish partial rows. After 12 rolls the mission ends with bonuses applied. A solid Moon score is 32-46 points; mission completionists reach 60+. Each lunar dispatch is freshly seeded so every base unfolds with different dice.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as WelcomeMoonSettings),
  reducer,
  isTerminal,
  component: WelcomeMoonGame,
};
