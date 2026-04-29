import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { WelcomeToSummerState, WelcomeToSummerAction, WelcomeToSummerSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { WelcomeToSummerGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const welcomeToSummerPlugin: GamePlugin<WelcomeToSummerState, WelcomeToSummerAction, typeof settings> = {
  id: "welcome-to-summer",
  title: "Welcome To: Summer",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Welcome To variant; summer suburb expansion with pool houses.",
  howToPlay: "Welcome To: Summer is a flip-and-write Welcome To variant set in a summer-themed suburb where pool houses and sunshine cards drive the score.\n\nEach round, click Roll to draw a number-action die (1-6). Click any empty cell to assign the value to a house. Skip if no house fits the value.\n\nScoring:\n- Each filled house scores its die value (1-6).\n- +5 per fully developed street (row).\n- +5 per fully developed avenue (column).\n- +10 for fully built summer suburb (all 16 houses).\n\n12 rolls available. Summer's pool houses reward symmetric construction: if you can complete two rows together, the bonuses stack. Strategy: fill borders first (rows 1 and 4, columns 1 and 4) — they double-count via row+column overlaps. A typical construction phase scores 35-55; perfect summer builds reach 65+. Welcome To: Summer is a sun-drenched, leisurely add-on for fans of the Welcome To franchise. Build slowly, build smart.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as WelcomeToSummerSettings),
  reducer,
  isTerminal,
  component: WelcomeToSummerGame,
};
