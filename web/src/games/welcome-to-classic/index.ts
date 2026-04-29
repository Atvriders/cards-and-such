import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { WelcomeToClassicState, WelcomeToClassicAction, WelcomeToClassicSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { WelcomeToClassicGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const welcomeToClassicPlugin: GamePlugin<WelcomeToClassicState, WelcomeToClassicAction, typeof settings> = {
  id: "welcome-to-classic",
  title: "Welcome To...",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Suburban roll-and-write; flip cards to develop houses.",
  howToPlay: "Welcome To... is a flip-and-write game where players develop a 1950s suburb by choosing number-action card pairs. In this solo adaptation you build a 4x4 suburban grid by rolling a single d6 each turn and marking a house plot with the value. Click Roll, then click any empty cell to assign the value as that house's number. You may Skip a roll if no plot works. Each filled plot adds its number to your score. Strategy: chase row and column bonuses (+5 each) and the +10 full-grid bonus. Numbers in classic Welcome To... must increase along streets, and while this adaptation simplifies that to free placement, you can still aim for ascending sequences for thematic satisfaction. After 12 rolls the game ends. A solid Welcome To... score is 32-46 points; suburb-completers reach 60+. The seeded random rolls ensure every suburb develops differently each game.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as WelcomeToClassicSettings),
  reducer,
  isTerminal,
  component: WelcomeToClassicGame,
};
