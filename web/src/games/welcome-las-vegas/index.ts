import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { WelcomeLasVegasState, WelcomeLasVegasAction, WelcomeLasVegasSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { WelcomeLasVegasGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const welcomeLasVegasPlugin: GamePlugin<WelcomeLasVegasState, WelcomeLasVegasAction, typeof settings> = {
  id: "welcome-las-vegas",
  title: "Welcome to New Las Vegas",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Casino and showroom Welcome To variant with neon-sign scoring.",
  howToPlay: "Welcome to New Las Vegas is a Welcome To... variant featuring casinos, showrooms, and neon signs. In this adaptation you build a Vegas strip on a 4x4 grid by rolling a single d6 each turn and assigning the value to a casino plot. Click Roll, then click any empty cell to mark it with the rolled number. You may Skip if the roll doesn't fit. Each marked plot adds its value to your score. Strategy: complete rows and columns for +5 bonuses each, plus +10 for filling the entire strip. Neon signs in classic Vegas simulate combo scoring; here, line completion drives bonuses. Higher dice values are valuable raw points, while lower ones can finish partial lines. After 12 rolls the game ends with bonuses applied. A solid Vegas score is 34-48 points; strip-completers reach 65+. Seeded random rolls ensure every visit to Vegas is a fresh dice puzzle.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as WelcomeLasVegasSettings),
  reducer,
  isTerminal,
  component: WelcomeLasVegasGame,
};
