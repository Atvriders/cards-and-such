import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { WelcomeToSpringState, WelcomeToSpringAction, WelcomeToSpringSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { WelcomeToSpringGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const welcomeToSpringPlugin: GamePlugin<WelcomeToSpringState, WelcomeToSpringAction, typeof settings> = {
  id: "welcome-to-spring",
  title: "Welcome To: Spring",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Welcome To variant; spring suburb with gardens and bloom bonuses.",
  howToPlay: "Welcome To: Spring is a Welcome To variant where the suburb blooms in springtime — gardens, bee houses, and flowering streets dominate the score sheet.\n\nEach round, click Roll to draw a die (1-6). Click any empty cell to plant or build with that pip value. Skip if no cell fits a bloom you want.\n\nScoring:\n- Each planted cell scores its pip (1-6).\n- +5 per row (street fully blossomed).\n- +5 per column (boulevard avenue planted).\n- +10 for fully bloomed suburb (Welcome to Spring achievement).\n\n12 rolls total. Spring is the most generous Welcome To — bonus stacking is common. Strategy: don't panic skip; even a 1 placed on a corner doubles via row+column. A typical run scores 40-55 points; full bloom reaches 65+. Welcome To: Spring is the gentle introduction to the franchise's flip-and-write rhythm. Plant deliberately, water with care, and watch your suburb burst into color over twelve sun-warmed rolls.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as WelcomeToSpringSettings),
  reducer,
  isTerminal,
  component: WelcomeToSpringGame,
};
